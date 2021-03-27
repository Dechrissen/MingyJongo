const BaseCommand = require('../BaseCommand.js');

class DailyCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'daily';
		this.description = 'Rewards a random number of croissaints between 1 and 25 (once per day).';
	}
	execute(message, args) {
		var query = { discord : message.author.tag };
		this.dbo.collection("users").findOne(query, (err, result) => {
			if (err) throw err;
			try {
				var updateCooldown = false;
				var timeDifference = Date.now() - result.last_daily;
				var cooldown = 86400000; // one day
				if (!result.last_daily || timeDifference > cooldown) {
					var updateCooldown = true;
				}
				else {
					message.reply("Cooldown: " + Math.floor(((cooldown - timeDifference) / 60000)) + " minutes.")
					return;
				}

				if (updateCooldown) {
					var currentAmount = result.croissants;
					var additional = Math.floor(25 * Math.random()) + 1;
					var newValue = { $set: { croissants: currentAmount + additional, last_daily: Date.now() } };
					this.dbo.collection("users").updateOne(query, newValue, (err, res) => {
						if (err) throw err;
						try {
							message.channel.send(message.author.username + " has received a daily bonus of " + additional + " Croissants.");
						}
						catch (err) {
							console.error(err);
						}
					});
				}
			}
			catch (err) {
				console.error(err);
				message.channel.send("User " + message.author.tag + " not in database!");
			}
		})
	}
}

module.exports = DailyCommand
