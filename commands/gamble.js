const BaseCommand = require('../BaseCommand.js');

class GambleCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'gamble';
		this.description = 'Wager Croissaints to double them or lose them at a 50/50 chance (once per hour).';
	}
	execute(message, args) {
    if (!args[0]) {
      message.reply("Invalid argument (one number required).")
      return;
    }
    if (args[1]) {
      message.reply("Invalid argument (one argument only).")
      return;
    }
    const wager = parseInt(args[0]);
    if (isNaN(wager)) {
      message.reply("Invalid argument (numbers only).")
      return;
    }
    if (wager <= 0) {
      message.reply("Invalid argument (positive nonzero numbers only).")
      return;
    }

		var query = { discord : message.author.tag };
		this.dbo.collection("users").findOne(query, (err, result) => {
			if (err) throw err;
			try {
				var updateCooldown = false;
				var timeDifference = Date.now() - result.last_gamble;
				var cooldown = 3600000; // one hour
				if (!result.last_gamble || timeDifference > cooldown) {
					var updateCooldown = true;
				}
				else {
					message.reply("Cooldown: " + Math.floor(((cooldown - timeDifference) / 60000)) + " minutes.")
					return;
				}

				if (updateCooldown) {
          if (result.croissaints < wager) {
            message.reply("Insufficient Croissants!");
            return;
          }
					var currentAmount = result.croissants;
          var outcome = Math.random();
          var additional;
          var status;
          if (outcome >= 0.5) {
            additional = wager;
            status = "Win! Plus "
          }
          else {
            additional = -wager;
            status = "Lose! Minus "
          }

					var newValue = { $set: { croissants: currentAmount + additional, last_gamble: Date.now() } };
					this.dbo.collection("users").updateOne(query, newValue, (err, res) => {
						if (err) throw err;
						try {
							message.reply(status + wager + " Croissants!");
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

module.exports = GambleCommand
