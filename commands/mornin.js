module.exports = {
	name: 'mornin',
	description: 'mornin',
	execute(message, args) {
		message.channel.send('mornin' + args);
	},
};
