const BaseCommand = require('../BaseCommand.js');

class PingCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'ping';
		this.description = 'Random Mingy Jongo quote.';
	}
	execute(message, args) {
		const mingyQuotes = [
            "Hello, {user}. Mumbo has big surprise for you.",
            "Har-har-harrr! Foolish {user}, you fell straight into my trap!",
            "I'm not that pathetic shaman you think I am! I'm Mingy Jongo and your worthless quest ends here, {user}...",
            "Foolish {user}, why do you return? A few more shocks from my stick seem necessary...",
            "As you see, {user}, there's no escape and resistance is futile!"
            ]
		const x = Math.floor(mingyQuotes.length * Math.random());
		message.channel.send(mingyQuotes[x].replace("{user}", message.author.username));
	}
}

module.exports = PingCommand
