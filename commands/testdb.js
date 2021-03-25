module.exports = {
	name: 'testdb',
	description: 'TEST',
	execute(message, args) {

    var query = message.author.tag;
      dbo.collection("users").findOne(query, function(err, result) {
        if (err) throw err;
        try {
          message.reply("You are " + result.twitch + " on Twitch.");
        }
        catch (err) {
          message.channel.send("User " + message.author.tag + " not found!");
        }
    })
	}
}
