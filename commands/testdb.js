const BaseCommand = require('../BaseCommand.js');

class TestdbCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'testdb';
		this.description = 'TEST';
	}
	execute(message, args) {
			var query = { "discord" : message.author.tag };
			this.dbo.collection("users").findOne(query, function(err, result) {
				if (err) throw err;
				try {
					message.reply("You are " + result.twitch + " on Twitch.");
				}
				catch (err) {
					message.channel.send("User " + message.author.tag + " not found!");
				}
			})
	}
}

module.exports = TestdbCommand
