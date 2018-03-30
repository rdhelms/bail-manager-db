'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;
const inmateDB = require('./inmateDB.js');

let result = '';
console.log("Starting inmate search!");
const casper = spawn('casperjs', ['casperjs/getInmates30day.js']);

casper.stderr.pipe(process.stderr);

casper.stdout.on('data', function(data) {
  result += data.toString();
});

casper.on('close', function() {
  console.log("casper search complete");

  parseHTML(result);
  // console.log("Result: " + result);
});

function parseHTML(pageHTML) {
  require('jsdom').env(pageHTML, function(err, window) {
  	if (err) {
  		console.error(err);
  		return;
  	}
  	const $ = require('jquery')(window);
    const inmateSearch = require('./inmateSearch.js');

    console.log("Searching HTML");
    var inmateResults = inmateSearch($);
    inmateDB.saveInmates(inmateResults.inmateList);
    // inmateDB.saveCrimes(inmateResults.crimeList);
    // console.log(inmateResults.crimeList.length);

    // var currentIndex = 0;
    // var numInmates = inmateResults.inmateList.length;
    // var firstInmate = inmateResults.inmateList[currentIndex];
    // saveInmate(firstInmate);
    // function saveInmate(inmate) {
    //   currentIndex++;
    //   var updated = inmateDB.save(inmate);
    //   if (updated && currentIndex != numInmates) {
    //     var nextInmate = inmateResults.inmateList[currentIndex];
    //     saveInmate(nextInmate);
    //   }
    // }

    // console.log(inmateResults.inmateList);
    // console.log(inmateResults.crimeList);
    // inmateDB.saveAll(inmateResults.inmateList);
    // inmateDB.save(inmateResults);
    // inmateDB.getAllDocs();
  });
}
