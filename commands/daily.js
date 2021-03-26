const BaseCommand = require('../BaseCommand.js');

class DailyCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'daily';
		this.description = 'Rewards a random number of croissaints between 1 and 10.';
	}
	execute(message, args) {
		message.channel.send("Soon™");
	}
}

module.exports = DailyCommand
