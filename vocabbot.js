let Discord = require('discord.js');
let bot     = new Discord.Client();
let fs      = require("fs");
let path    = require("path");
let needle  = require('needle');
let nodehun = require('nodehun');

let vocabulary = require(path.join(__dirname, 'inc', 'vocabulary'));
let config = require(path.join(__dirname, 'inc', 'config.json'));

bot.login(config.token);

let prefix = config.prefix;

bot.on('ready', () => {
	console.log((new Date()) + ' Vocabulary bot started');
	bot.user.setPresence({ game: { name: `${prefix}help to see commands`, type: 0 } });
});

bot.on('message', message => {
	if(message.author.bot) return;

	const usedPref = message.content.slice(0, 1);
	if(usedPref != prefix) return;
	
	const args = message.content.slice(prefix.length).trim().split(/\s+/g);
	const command = args.shift().toLowerCase();

	switch (command){
		case 'help':
			var help = [
				'My commands:',
				`${prefix}help - this message`,
				`${prefix}def [word or phrase] - shows a word definition`,
				`${prefix}urban [word or phrase] - shows urban dictionary definitions for requested word/phrase`,
				`${prefix}examples [word or phrase] - shows exaples of a word in a sentence (max 10 per noun/verb etc.)`
			];
			message.channel.send('```' + help.join('\n') + '```');
			break;
		case 'def':
			vocabulary.getEntries(message, args);
			break;
		case 'urban':
			vocabulary.getUrban(message, args);
			break;
		case 'examples':
			vocabulary.examples(message, args);
			break;
	}
});