const Discord = require('discord.js');
const fs = require('fs');
const config = require("./config.json");
const http = require('http');
const url = require('url');
const fetch = require('node-fetch');

const prefix = "!";
const port = 53134;


// Discord bot client
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
  	message.reply('Error trying to execute that command.');
  }
});

client.login(config.BOT_TOKEN);



// Webserver for OAuth2
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
		const body = new URLSearchParams(data);

		authRequest(body);

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


// Gets the access token by exchanging auth code with Discord
async function getToken (body) {
	let discordRes = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: body,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
	if (!discordRes.ok) {
		console.log('getToken response not ok')
	}
	let info = await discordRes.json();
	return info;
}

// Gets a user's Discord username#discriminator
async function getUsername (info) {
	let userRes = await fetch('https://discord.com/api/users/@me', {
		headers: {
			authorization: `${info.token_type} ${info.access_token}`,
		},
	});
	let userJson = await userRes.json();
	const { username, discriminator } = userJson;
	console.log(`Username: ${username}#${discriminator}`);
}

// Gets a user's connected Twitch account
async function getAccounts (info) {
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

// Main function that handles getting token, Discord username, Twitch account
async function authRequest(body) {
	try {
			let info = await getToken(body);
			//await new Promise(r => setTimeout(r, 3000));
			await getUsername(info);
			//await new Promise(r => setTimeout(r, 3000));
			await getAccounts(info);
	}
	catch {
			console.error(e);
	}
}
