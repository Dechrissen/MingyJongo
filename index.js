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
var dbo = null;

var MongoClient = require('mongodb').MongoClient;
var db_url = config.DB_URL;
MongoClient.connect(db_url, { useUnifiedTopology: true }, function(err, db) {
	if (err) throw err;
	dbo = db.db("derkscord");
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
	client.user.setActivity('with his Zap Stick');
	derkscord_guild = client.guilds.cache.find(r => r.name === "Derkscord");
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
		message.channel.send("**Bot commands**: " + new_stringOfCommands);
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
	} else if (urlObj.pathname === '/') {
		responseCode = 200;
		content = fs.readFileSync('./success.html');
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
	//const username_discriminator = username + '#' + discriminator;
	console.log(`Username: ${username}#${discriminator}`);

	return username;
}

// Gets a user's connected Twitch account
async function getAccounts (info) {
	let userRes = await fetch('https://discord.com/api/users/@me/connections', {
		headers: {
			authorization: `${info.token_type} ${info.access_token}`,
		},
	});
	let userJson = await userRes.json();
	let twitch_username = '';
	var i;
	for (i = 0; i < userJson.length; i++) {
		if (userJson[i]["type"] == ["twitch"]) {
			twitch_username = userJson[i]["name"];
			console.log("Twitch: " + userJson[i]["name"]);
			return twitch_username;
		}
	}
}

// Main async function that handles getting token, Discord username, Twitch account
async function authRequest(body) {
	try {
			let info = await getToken(body);
			//await new Promise(r => setTimeout(r, 3000));
			let d_username = await getUsername(info);
			//await new Promise(r => setTimeout(r, 3000));
			let twitch_username = await getAccounts(info);
			discordTwitchLinker(d_username, twitch_username, dbo);
	}
	catch (e) {
			console.error(e);
	}
}

// Links a user's Discord username with their Twitch username in the 'users' database
async function discordTwitchLinker(discord, twitch, dbo) {
	var success = true;
	var query = { "twitch" : twitch };
	dbo.collection("users").findOne(query, function(err, result) {
		if (err) throw err;
		// First check if there is already a Discord username associated with this Twitch account
		if (result.discord != null) {
			success = false;
		}

		// Only do the DB update if no Discord username is associated with this Twitch account
		try {
			if (success) {
				var newValue = { $set: { discord: discord } };
				dbo.collection("users").updateOne(query, newValue, (err, res) => {
					if (err) throw err;
					try {
						console.log('Successfully linked Discord (' + discord + ') to Twitch (' + twitch + ')')
					}
					catch (err) {
						console.error(err);
					}
				});
			}

			// DM the user with a success or failure message
			derkscord_guild.members.fetch({ query: discord, limit: 1 }).then((m) => {
				if(m == null || m.first() == null)  return null;
				let user = m.first().user;
				return user;
			})
			.then((user) => {
				client.users.fetch(user.id).then((d_usr) => {
					if (success) {
						d_usr.send('**Success**: Your Discord and Twitch accounts have been linked in Derkscord. ✅');
					}
					else {
						d_usr.send('**Failure**: There is already a Discord username linked to your Twitch account in Derkscord. ❌');
					}
				}).catch((e) => console.log(e))
			})
			.catch((e) => {
				console.log(e);
			});
		}
		catch (err) {
			console.log("Twitch user " + twitch + " not in database!");
		}
	})
}
