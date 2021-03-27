var MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

var db_url = "mongodb://localhost:27017/";
var user_objects = [];

MongoClient.connect(db_url, { useUnifiedTopology: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("derkscord");
  try {
    const data = fs.readFileSync('croissants.txt', 'utf8');
    const lines = data.split(/\r?\n/);
    lines.forEach((line) => {
      if (line) {
        const twitch = line.split(" ")[0];
        const score = parseInt(line.split(" ")[1]);
        user_objects.push( {twitch:twitch, discord:null, croissants:score, last_daily:null, last_slots:null, last_gamble:null} );
      }

    });
  }
  catch (err) {
    console.log(err);
  }

  dbo.createCollection("users", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
  });

  dbo.collection("users").insertMany(user_objects, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });

  //db.close();
});
