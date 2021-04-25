const BaseCommand = require('../BaseCommand.js');

class TwitchRoleCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'twitchrole';
		this.description = 'Add Twitch role to user.';
	}
	execute(message, args) {
		let member = message.member;
    let role = message.guild.roles.cache.find(r => r.name === 'Twitch');
    member.roles.add(role).catch(console.error);
		message.reply('You have been given the Twitch role!');
	}
}

module.exports = TwitchRoleCommand
