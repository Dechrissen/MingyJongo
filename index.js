const Discord = require('discord.js');
const fs = require('fs');
const config = require("./config.json");
const http = require('http');
const url = require('url');
const fetch = require('node-fetch');

const prefix = "!";
const port = 53134;


// discord bot
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", function(message) {
  // checks to see if message author is a bot, or if it doesn't start with "!"
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
  	client.commands.get(command).execute(message, args);
  } catch (error) {
  	console.error(error);
  	message.reply('there was an error trying to execute that command!');
  }

});

client.login(config.BOT_TOKEN);



// webserver
http.createServer((req, res) => {
	let responseCode = 404;
	let content = '404 Error';

	const urlObj = url.parse(req.url, true);

	if (urlObj.query.code) {
		const accessCode = urlObj.query.code;
		const data = {
			client_id: '822534331079327803',
			client_secret: config.CLIENT_SECRET,
			grant_type: 'authorization_code',
			redirect_uri: 'http://localhost:53134',
			code: accessCode,
			scope: 'identify connections',
		};


			async function getUsername () {
				let discordRes = await fetch('https://discord.com/api/oauth2/token', {
					method: 'POST',
					body: new URLSearchParams(data),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				});
				if (!discordRes.ok) {
					console.log('username not ok')
					return;
				}
				let info = await discordRes.json();
				let userRes = await fetch('https://discord.com/api/users/@me', {
					headers: {
						authorization: `${info.token_type} ${info.access_token}`,
					},
				});
				let userJson = await userRes.json();
				const { username, discriminator } = userJson;
				console.log(`Username: ${username}#${discriminator}`);
			}

			async function getAccounts () {

				let discordRes = await fetch('https://discord.com/api/oauth2/token', {
					method: 'POST',
					body: new URLSearchParams(data),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				});
				if (!discordRes.ok) {
					console.log('accounts not ok')
					return;
				}
				let info = await discordRes.json();
				let userRes = await fetch('https://discord.com/api/users/@me/connections', {
					headers: {
						authorization: `${info.token_type} ${info.access_token}`,
					},
				});
				let userJson = await userRes.json();
				var i;
				for (i = 0; i < userJson.length; i++) {
	  			if (userJson[i]["type"] == ["twitch"]) {
						console.log("Twitch: " + userJson[i]["name"]);
					}
				}
			}

			getUsername().catch(e => { console.error(e) })
			getAccounts().catch(e => { console.error(e) })
	}

	if (urlObj.pathname === '/') {
		responseCode = 200;
		content = fs.readFileSync('./index.html');
	}

	res.writeHead(responseCode, {
		'content-type': 'text/html;charset=utf-8',
	});

	res.write(content);
	res.end();
})
	.listen(port);
