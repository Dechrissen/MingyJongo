const BaseCommand = require('../BaseCommand.js');

class FollowCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'follow';
		this.description = 'Add Follower role to user.';
	}
	execute(message, args) {
		let member = message.member;
    let role = message.guild.roles.cache.find(r => r.name === 'Follower');
    member.roles.add(role).catch(console.error);
		message.reply("You are now subscribed to content updates from Dechrissen.");
	}
}

module.exports = FollowCommand
