const BaseCommand = require('../BaseCommand.js');

class CroissantsCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'croissants';
		this.description = 'Returns the amount of Croissants the user has.';
	}
	execute(message, args) {
		var query = { discord: message.author.tag };
		this.dbo.collection("users").findOne(query, function(err, result) {
			if (err) throw err;
			try {
				message.reply("You have " + result.croissants + " croissants.");
			}
			catch (err) {
				message.channel.send("User " + message.author.tag + " not found!");
			}
		})
	}
}

module.exports = CroissantsCommand
