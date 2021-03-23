module.exports = {
	name: 'acrole',
	description: 'Add Animal Crossing role to user.',
	execute(message, args) {
    let member = message.member;
    let role = message.guild.roles.cache.find(r => r.name === 'Animal Crossing');
    member.roles.add(role).catch(console.error);
		message.reply('You have been given the Animal Crossing role!');
	}
};
