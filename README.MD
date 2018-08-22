### Vocabulary bot for discord - showing word definitions and examples in a sentence

Has 3 commands (if $ is your prefix then):

$def [word or phrase] - shows a word definition  
$urban [word or phrase] - shows urban dictionary definitions for requested word/phrase  
$examples [word or phrase] - shows exaples of a word in a sentence (code limited to 10 per noun/verb etc.)  

in order to use this bot you need to create `config.json` file inside `inc` directory, with this structure:

{  
	"prefix": "$",  
	"token": "NDc4MLU5MTc1MTIyMjg4Fjgw.DlGpyQ.-6KyJgNQdycudenivIBCQY_9Xh0",  
	"oxfordAppId": "93j972d8",  
	"oxfordAppKey": "f0a2df16f3acc2b65f29613281e36ac2",  
	"urbanKey": "4g44cpi6dLmshUtUA20dTdR1m6CVp1thKB2jsnM0iet5kLyMXY"  
}  

`token` - user token of your discord bot  
`oxfordAppId` and `oxfordAppKey` - your oxford API credentials (https://developer.oxforddictionaries.com/documentation)  
`urbanKey` - urban dictionary API key (https://market.mashape.com/community/urban-dictionary)  

then you can invite your bot to a server with invite link like this one:  
https://discordapp.com/api/oauth2/authorize?client_id=--CLIENT_ID_OF_YOUR_BOT--&scope=bot&permissions=0