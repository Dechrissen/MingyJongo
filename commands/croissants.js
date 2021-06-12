const BaseCommand = require('../BaseCommand.js');

class CroissantsCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'croissants';
		this.description = 'Returns the amount of Croissants the user has.';
	}
	execute(message, args) {
		var query = { discord: message.author.username };
		this.dbo.collection("users").findOne(query, function(err, result) {
			if (err) throw err;
			try {
				message.channel.send(message.author.username + " has " + result.croissants + " Croissants.");
			}
			catch (err) {
				message.channel.send("User " + message.author.username + " not in database! Link your Discord and Twitch accounts here: https://derekandersen.net/mingy-jongo-auth");
			}
		})
	}
}

module.exports = CroissantsCommand
