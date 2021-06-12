const BaseCommand = require('../BaseCommand.js');

class StreamRoleCommand extends BaseCommand {
	constructor (dbo) {
		super(dbo);
		this.name = 'streamrole';
		this.description = 'Add Stream role to user.';
	}
	execute(message, args) {
		let member = message.member;
    let role = message.guild.roles.cache.find(r => r.name === 'Stream');
    member.roles.add(role).catch(console.error);
		message.reply('You have been given the Stream role.');
	}
}

module.exports = StreamRoleCommand
