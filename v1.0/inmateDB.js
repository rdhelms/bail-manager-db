var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var password = encodeURIComponent(credentials.mongo.password);
var database = encodeURIComponent("InmateSearch");
var uri = 'mongodb://rdhelms:' + password + '@rhelms-shard-00-01-8ucmr.mongodb.net:27017,rhelms-shard-00-01-8ucmr.mongodb.net:27017,rhelms-shard-00-02-8ucmr.mongodb.net:27017/' + database + '?ssl=true&replicaSet=rhelms-shard-0&authSource=admin';

function testConnection() {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    console.log("Connected successfully to server");
    db.close();
  });
}

function getAllDocs() {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    console.log("Connected successfully to server");
    db.collection('inmates').find().toArray(function(err, docs) {
      console.log("Found the following records", docs);
      db.close();
    });
  });
}

function save(newData) {
  console.log("Saving to Database");
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    console.log("Connected successfully to server");
    var dbUpdate = JSON.parse(JSON.stringify(newData));
    db.collection('inmates').insertOne(dbUpdate, function(err, result) {
      if (err) throw err;
      console.log("Saved data to the database");
      console.log("New Id: " + dbUpdate._id);
      db.close();
      return true;
    });
  });
}

function saveInmates(newData) {
  var debug1 = true;
  var debug2 = true;
  var debug3 = true;
  console.log("Saving Inmates to Database");
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    console.log("Connected successfully to server");
    var newInmates = JSON.parse(JSON.stringify(newData));
    db.collection('inmates').find().toArray(function(err, docs) {
      var oldInmates = docs;
      for (var i = 0; i < newInmates.length; i++) {
        var newInmate = newInmates[i];
        var alreadyExists = false;
        for (var j = 0; j < oldInmates.length; j++) {
          var oldInmate = oldInmates[j];
          if (oldInmate.name == newInmate.name) {
            alreadyExists = true;
            for (var newChargeIndex = 0; newChargeIndex < newInmate.charges.length; newChargeIndex++) {
              var newCharge = newInmate.charges[newChargeIndex];
              var existingCharge = false;
              for (var oldChargeIndex = 0; oldChargeIndex < oldInmate.charges.length; oldChargeIndex++) {
                var oldCharge = oldInmate.charges[oldChargeIndex];
                if (oldCharge.dateCharged == newCharge.dateCharged && oldCharge.description == newCharge.description && oldCharge.courtDocket == newCharge.courtDocket) {
                  existingCharge = true;
                  if (oldCharge.dateReleased != newCharge.dateReleased || oldCharge.bondType != newCharge.bondType || oldCharge.bailAmountString != newCharge.bailAmountString || oldCharge.daysInJail != newCharge.daysInJail) {
                    oldCharge = newCharge;
                    var oldBailAmountString = oldCharge.bailAmountString;
                    oldBailAmountString = oldBailAmountString.substring(1);
                    oldBailAmountString = oldBailAmountString.split(",").join("");
                    var oldBailAmount = Number(oldBailAmountString);
                    var newBailAmountString = newCharge.bailAmountString;
                    newBailAmountString = newBailAmountString.substring(1);
                    newBailAmountString = newBailAmountString.split(",").join("");
                    var newBailAmount = Number(newBailAmountString);
                    oldInmate.totalBailAmount = Number(oldInmate.totalBailAmount) + (newBailAmount - oldBailAmount);
                    oldInmate.dateReleased = newCharge.dateReleased;
                    if (debug1) {
                      console.log("Updating charge from: ", oldCharge);
                      console.log("To updated charge: ", newCharge);
                      console.log("For inmate: ", oldInmate);
                      debug1 = false;
                    }
                  }
                }
              }
              if (!existingCharge) {
                oldInmate.charges.push(newCharge);
                var newBailAmountString = newCharge.bailAmountString;
                newBailAmountString = newBailAmountString.substring(1);
                newBailAmountString = newBailAmountString.split(",").join("");
                var newBailAmount = Number(newBailAmountString);
                oldInmate.totalBailAmount = Number(oldInmate.totalBailAmount) + newBailAmount;
                oldInmate.dateReleased = newCharge.dateReleased;
                if (debug2) {
                  console.log("Found new charge: ", newCharge);
                  console.log("For inmate: ", oldInmate);
                  debug2 = false;
                }
              }
            }
          }
        }
        if (!alreadyExists) {
          oldInmates.push(newInmate);
          if (debug3) {
            console.log("New Inmate: ", newInmate);
            debug3 = false;
          }
        }
      }
      // db.collection('inmates').insertMany(oldInmates, function(err, result) {
      //   if (err) throw err;
      //   console.log("Saved Inmates to the database");
        db.close();
      // });
    });
  });
}

function saveCrimes(newData) {
  console.log("Saving Crimes to Database");
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    console.log("Connected successfully to server");
    var dbUpdate = JSON.parse(JSON.stringify(newData));
    db.collection('crimes').insertMany(dbUpdate, function(err, result) {
      if (err) throw err;
      console.log("Saved Crimes to the database");
      db.close();
    });
  });
}

module.exports = {
  testConnection: testConnection,
  getAllDocs: getAllDocs,
  save: save,
  saveInmates: saveInmates,
  saveCrimes: saveCrimes
};
