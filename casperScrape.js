'use strict';
const fs = require('fs');
const spawn = require('child_process').spawn;

console.log("Starting casperScrape...");
const casper = spawn('casperjs', ['casperjs/getInmates30day.js']);

let result = '';
casper.stderr.pipe(process.stderr);
casper.stdout.on('data', function(data) {
  result += data.toString();
});

casper.on('close', function() {
  console.log("HTML scraped. Parsing data...");
  parseHTML(result);
});

function parseHTML(pageHTML) {
  require('jsdom').env(pageHTML, function(err, window) {
  	if (err) {
  		console.error(err);
  		return;
  	}

  	const $ = require('jquery')(window);
    const parseInmateHTML = require('./parseInmateHTML.js');
    const updateInmateDB = require('./updateInmateDB.js');

    updateInmateDB.getAllInmates().then(function(allInmates) {
      updateInmateDB.getAllCrimes().then(function(allCrimes) {
        console.log("Reading through data rows...");
        var inmateResults = parseInmateHTML($, allInmates, allCrimes);
        console.log("Finished parsing data");
        updateInmateDB.saveInmates(inmateResults.inmateList).then(function(inmateResult) {
          updateInmateDB.saveCrimes(inmateResults.crimeList).then(function(crimeResult) {
            console.log("Done!");
          })
        })
      });
    });
  });
}
