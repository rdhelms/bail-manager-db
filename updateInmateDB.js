var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var credentials = require('./credentials.js');
var password = encodeURIComponent(credentials.mongo.password);
var database = encodeURIComponent("InmateSearch");
var uri = 'mongodb://rdhelms:' + password + '@rhelms-shard-00-01-8ucmr.mongodb.net:27017,rhelms-shard-00-01-8ucmr.mongodb.net:27017,rhelms-shard-00-02-8ucmr.mongodb.net:27017/' + database + '?ssl=true&replicaSet=rhelms-shard-0&authSource=admin';

function testConnection() {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        console.log("Connected successfully to server");
        db.close();
    });
}

function getAllInmates() {
    var inmatePromise = new Promise(function (resolve, reject) {
        MongoClient.connect(uri, function (err, db) {
            if (err) throw err;
            console.log("Connected successfully to server");
            var allInmates = {};
            db.collection('inmates').find().toArray(function (err, docs) {
                console.log("Found existing inmates from database");
                var inmateArray = docs;
                inmateArray.forEach(function (inmate) {
                    var name = inmate.name;
                    allInmates[name] = inmate;
                    if (inmateArray.indexOf(inmate) == inmateArray.length - 1) {
                        db.close();
                        resolve(allInmates);
                    }
                });
            });
        });
    });
    return inmatePromise;
}

function getAllCrimes() {
    var crimePromise = new Promise(function (resolve, reject) {
        MongoClient.connect(uri, function (err, db) {
            if (err) throw err;
            console.log("Connected successfully to server");
            var crimeNames = [];
            db.collection('crimes').find().toArray(function (err, docs) {
                console.log("Found existing crimes from database");
                var crimeArray = docs;
                crimeArray.forEach(function (crime) {
                    crimeNames.push(crime.name);
                    if (crimeArray.indexOf(crime) == crimeArray.length - 1) {
                        db.close();
                        resolve(crimeNames);
                    }
                });
            });
        });
    });
    return crimePromise;
}

function saveInmate(newData) {
    console.log("Saving Inmate" + newData.name + "to Database");
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        console.log("Connected successfully to server");
        var newInmate = JSON.parse(JSON.stringify(newData));
        db.collection('inmates').find().toArray(function (err, docs) {
            db.close();
        });
    });
}

function saveInmates(newData) {
    console.log("Saving Inmates to Database");
    var savedInmatesPromise = new Promise(function (resolve, reject) {
        MongoClient.connect(uri, function (err, db) {
            if (err) throw err;
            console.log("Connected successfully to server");
            var newInmates = JSON.parse(JSON.stringify(newData));
            var allNames = Object.keys(newInmates);
            allNames.forEach(function (name) {
                db.collection('inmates').updateMany({
                    name: name
                }, {
                    $set: {
                        name: newInmates[name].name,
                        charges: newInmates[name].charges,
                        dateCharged: newInmates[name].dateCharged,
                        dateReleased: newInmates[name].dateReleased,
                        totalBailAmount: newInmates[name].totalBailAmount
                    },
                    $unset: {
                        dataRows: '',
                        inmateNumber: '',
                        rowIndex: ''
                    }
                }, {
                    upsert: true
                }, function (err, result) {
                    console.log(err);
                    console.log(result);
                    if (allNames.indexOf(name) == allNames.length - 1) {
                        resolve("Finished updating inmates!");
                        db.close();
                    }
                });
            });
        });
    });
    return savedInmatesPromise;
}

function saveCrimes(newData) {
    console.log("Saving Crimes to Database");
    var savedCrimesPromise = new Promise(function (resolve, reject) {
        MongoClient.connect(uri, function (err, db) {
            if (err) throw err;
            console.log("Connected successfully to server");
            var newCrimes = JSON.parse(JSON.stringify(newData));
            if (newCrimes.length > 0) {
                db.collection('crimes').insertMany(newCrimes, function (err, result) {
                    if (err) throw err;
                    console.log("Saved Crimes to the database");
                    resolve("Finished updating crimes");
                    db.close();
                });
            } else {
                resolve("No crimes to update");
                db.close();
            }
        });
    });
    return savedCrimesPromise;
}

module.exports = {
    testConnection: testConnection,
    getAllInmates: getAllInmates,
    getAllCrimes: getAllCrimes,
    saveInmate: saveInmate,
    saveInmates: saveInmates,
    saveCrimes: saveCrimes
};