let needle  = require('needle');
let nodehun = require('nodehun');
let fs      = require('fs');
let path    = require('path');

let affbuf = fs.readFileSync(path.join(__dirname, 'dict', 'en_US.aff'));
let dictbuf = fs.readFileSync(path.join(__dirname, 'dict', 'en_US.dic'));
let dict = new nodehun(affbuf,dictbuf);

let config = require(path.join(__dirname, 'config.json'));

let options = {
	headers: {
		'app_id': config.oxfordAppId,
		'app_key': config.oxfordAppKey,
		"Accept": "application/json"
	}
};
let urbanOptions = {
	headers: {
		'X-Mashape-Key': config.urbanKey,
		'Accept': 'text/plain'
	}
};

module.exports = {
	examples: function(message, args){
		let word = encodeURIComponent(args.join(' '));
		let url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}/sentences`;
		if(!args[0]){
			message.channel.send(`<@${message.member.id}> Use this command with argument`);
			return;
		}
		needle.get(url, options, (err, res) => {
			if(err){
				console.log('Error in dict api: ' + err);
				return;
			}
			if(!res.body['results'] || !res.body['results'][0] || !res.body['results'][0].lexicalEntries){
				message.channel.send('No results for this request');
				return;
			}
			let entries = res.body['results'][0].lexicalEntries;
			let result = [];
			let target = args.join(' ').toUpperCase();
			let regex = new RegExp(`(${target})`, 'i');
			result.unshift('**' + target + '**\n\n');
			for (let i = 0; i < entries.length; i++) {
				this.addRes(result, '__**' + entries[i].lexicalCategory + '**__:\n\n');
				let sentences = entries[i].sentences;
				for (let j = 0; j < sentences.length && j < 10; j++) {
					this.addRes(result, 'Main region: __' + sentences[j].regions[0] + '__\n');
					this.addRes(result, '_"' + sentences[j].text.replace(regex, `**$1**`) + '"_\n\n');
				}
			}
			for (let i = 0; i < result.length; i++) {
				message.channel.send(result[i]);
			}
		});
	},
	getEntries: function(message, args){
		let isPhrase = args.length > 1 ? true : false;
		let word = encodeURIComponent(args.join(' '));
		let origWord = args.join(' ');
		let url = 'https://od-api.oxforddictionaries.com/api/v1/entries/en/' + word;
		let result = [];
		needle.get(url, options, (err, res) => {
			if(err){
				console.log('Error in dict api: ' + err);
				return;
			}
			try{
				let results = res.body.results || res.body;
				if(results[0].id){
					this.addRes(result, '**' + this.cap(results[0].id).replace(/_/g, ' ') + '**');
				}
				let entries = results[0].lexicalEntries;
				if(entries[0].pronunciations && entries[0].pronunciations.length){
					let ipa = entries[0].pronunciations[0].phoneticSpelling;
					this.addRes(result, ' [**' + ipa + '**]');
				}
				this.addRes(result, '\n');
				for (let i = 0; i < entries.length; i++) {
					let defsNum = 0;
					if(entries[i].entries[0].senses[0].definitions) this.addRes(result, '\n__**' + entries[i].lexicalCategory + '**__:\n');
					let catEntries = entries[i].entries;
					for (let j = 0; j < catEntries.length; j++) {
						let entrySenses = catEntries[j].senses;
						for (let k = 0; k < entrySenses.length; k++) {
							let defs = entrySenses[k].definitions;
							//if(!defs || !defs.length) throw "No results for this";
							let examples = entrySenses[k].examples;
							let subSenses = entrySenses[k].subsenses;
							if(defs){
								for (let l = 0; l < defs.length; l++) {
									defsNum++;
									this.addRes(result, '\n**' + defsNum + '. ' + this.cap(defs[l] + '**\n'));
								}
							}
							if(examples){
								for (let l = 0; l < examples.length; l++) {
									if(examples[l].text) this.addRes(result, '*"' + this.cap(examples[l].text) + '"*\n');
								}
							}
						}
					}
				}
			}catch(e){
				if(!isPhrase){
					dict.spellSuggestions(word, function(err, correct, suggestions, origWord){
						suggestions = suggestions.map(elem => {return elem.replace(/^([\s\S]+)$/, '*$1*')}).join(', ');
						suggestions = suggestions ? `\nSuggestions: ${suggestions}` : '';
						message.channel.send(`No results for **${origWord}**${suggestions}`);
					});
				}else message.channel.send(`No results for **${origWord}**`);
				return;
			}
			//result.unshift('**' + args.join(' ').toUpperCase() + '**\n\n');
			for (let i = 0; i < result.length; i++) {
				message.channel.send(result[i]);
			}
		});
	},
	getUrban: function(message, args){
		let result = [];
		let origWord = args.join(' ');
		let word = encodeURIComponent(args.join(' '));
		let url = `https://mashape-community-urban-dictionary.p.mashape.com/define?term=${word}`;
		try{
			needle.get(url, urbanOptions, (err, res) => {
				let json = res.body;
				this.addRes(result, `Urban dictionary entries for __**${this.cap(origWord)}:**__\n\n`);
				for (let i = 0; i < json.list.length; i++) {
					let difinition = json.list[i].definition.replace(/([\*_`])/g, '\$1').replace(/\n+|(\r\n)+/g, '\n').trim();
					let example = json.list[i].example.replace(/([\*_`])/g, '\$1').replace(/\n+|(\r\n)+/g, '\n').trim();
					this.addRes(result, `__**${(i+1)})**__ **${difinition}**\n\n__Example:__\n\n*${example}*\n\n`);
				}
				if(json.list.length){
					for (let i = 0; i < result.length; i++) {
						message.channel.send(result[i]);
					}
				}else{
					message.channel.send(`No results for **${origWord}**`);
				}
			});
		}catch(e){
			message.channel.send(`No results for **${origWord}**`);
		}
	},
	addRes: function(res, str, ending = ''){ // fill results array strings with 2000 characters max, to fit discord msg limit
		let index = res.length > 0 ? res.length - 1 : 0;
		let lastVal = res[index] || '';
		if((lastVal + ending + str).length >= 2000) res.push(ending + str);
		else res[index] = lastVal + ending + str;
	},
	cap: function(text){
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
}