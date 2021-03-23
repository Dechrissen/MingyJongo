module.exports = {
	name: 'streamrole',
	description: 'Add Stream role to user.',
	execute(message, args) {
    let member = message.member;
    let role = message.guild.roles.cache.find(r => r.name === 'Stream');
    member.roles.add(role).catch(console.error);
		message.reply('You have been given the Stream role!');
	}
};
