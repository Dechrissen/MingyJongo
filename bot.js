const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Hello. Mumbo has big surprise for you.');
  }
});

client.login('ODIyNTM0MzMxMDc5MzI3ODAz.YFTqyg.dCd99XWbX4elEaBUj3c5-Bf1Ldo');
