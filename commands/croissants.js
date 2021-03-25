module.exports = {
	name: 'croissants',
	description: 'Returns the amount of Croissants the user has.',
	execute(message, args) {
    var MongoClient = require('mongodb').MongoClient;
    var db_url = "mongodb://localhost:27017/";
    MongoClient.connect(db_url, { useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("derkscord");
      var query = { discord: message.author.tag };
      dbo.collection("users").findOne(query, function(err, result) {
        if (err) throw err;
        try {
          message.reply("You have " + result.croissants + " croissants.");
        }
        catch (err) {
          message.channel.send("User " + message.author.tag + " not found!");
        }
        db.close();
      });
    })
	}
};
