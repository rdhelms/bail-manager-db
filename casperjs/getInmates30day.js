var casper = require('casper').create();

casper.on('remote.message', function(msg) {
    // this.echo('remote message caught: ' + msg);
})

casper.start('http://www2.durhamcountync.gov/sheriff/ips/default.aspx');

casper.then(function() {
  this.waitForSelector('#ddlDateListing');
});

casper.then(function() {
  var numResults = this.fetchText('#icLabel1');
  // this.echo("Number of Results: " + numResults);
});

casper.then(function() {
  this.evaluate(function() {
    var dateChooser = document.getElementById('ddlDateListing');
    dateChooser.value = "30";
    var evt = document.createEvent("UIEvents");
    evt.initUIEvent("change", true, true);
    dateChooser.dispatchEvent(evt);
  });
});

casper.waitFor(function check() {
  return Number(this.fetchText('#icLabel1')) > 500;
}, function then() {
  this.captureSelector('numResults.png', '#icLabel1');
}, function timeout() {
  this.echo("Failed to load the page");
}, 30000);

casper.then(function() {
  var numResults = this.fetchText('#icLabel1');
  // this.echo("Number of Results: " + numResults);
});

casper.then(function() {
  console.log(this.getHTML());
});

casper.run();
