#!/usr/bin/env node

const Discord = require('discord.js');
const fs = require('fs');
const http = require('http');
const url = require('url');
const fetch = require('node-fetch');
const config = require("./config.json");
const basicCommands = require('./commands/basic_commands.json');

var commandList = []; // for storing a list of command names
const prefix = "!";

const client = new Discord.Client();

var MongoClient = require('mongodb').MongoClient;
var db_url = config.DB_URL;
MongoClient.connect(db_url, { useUnifiedTopology: true }, function(err, db) {
	if (err) throw err;
	var dbo = db.db("derkscord");
	setBotCommands(client, dbo);
	// Shutdown handler to close db connection
	require('shutdown-handler').on('exit', function() {
		db.close();
		console.log("Shutting down...");
	});
})

// sets a Discord.Collection of bot commands
function setBotCommands (client, dbo) {
	client.commands = new Discord.Collection();
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const CommandClass = require(`./commands/${file}`);
		const command = new CommandClass(dbo);
		client.commands.set(command.name, command);
		commandList.push(command.name);
	}
	for (const name in basicCommands) {
		commandList.push(name);
	}
}

// Event listeners
client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}.`);
});

client.on("message", message => {
  // checks to see if message author is a bot, or if it doesn't start with "!"
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	// !commands
	if (command == "commands") {
		var listOfCommands = [];
		for (const c in commandList) {
			listOfCommands.push(prefix + commandList[c]);
		}
		const search = ',';
		const replacer = new RegExp(search, 'g');
		var stringOfCommands = listOfCommands.toString();
		const new_stringOfCommands = stringOfCommands.replace("\\[|\\]", "").replace(replacer, " | ");
		message.channel.send("**Available commands**: " + new_stringOfCommands);
		// log user's command use in console
		console.log(`${message.author.tag} in #${message.channel.name}: !commands`);
		return;
	}

	// basic text command
  if (!client.commands.has(command)) {
		if (basicCommands[command]) {
			message.channel.send(basicCommands[command]);
		}
		else {
			message.reply("No such command.");
			return;
		}
	}
	// other commands
	else {
		try {
	  	client.commands.get(command).execute(message, args);
	  } catch (error) {
	  	console.error(error);
	  	message.reply('Error trying to execute that command.');
	  }
	}
	// log user's command use in console
	console.log(`${message.author.tag} from #${message.channel.name}: ${message.content}`);

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
			redirect_uri: config.OAUTH_REDIRECT,
			code: accessCode,
			scope: 'identify connections',
		};
		const body = new URLSearchParams(data);

		authRequest(body);
	}

	if (urlObj.pathname === '/mingy-jongo-auth') {
		responseCode = 200;
		content = fs.readFileSync('./index.html');
	}

	res.writeHead(responseCode, {
		'content-type': 'text/html;charset=utf-8',
	});

	res.write(content);
	res.end();
})
	.listen(config.OAUTH_PORT);


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

// Main async function that handles getting token, Discord username, Twitch account
async function authRequest(body) {
	try {
			let info = await getToken(body);
			//await new Promise(r => setTimeout(r, 3000));
			await getUsername(info);
			//await new Promise(r => setTimeout(r, 3000));
			await getAccounts(info);
	}
	catch (e) {
			console.error(e);
	}
}
