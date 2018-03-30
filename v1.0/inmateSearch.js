function inmateSearch($) {

  // Bailable criteria
  var bailLimit = 2000;

  // Output
  var inmateList = [];
  var allCrimes = [];
  var descriptionList = [];

  var allNames = $('a.rvsnavy-bold');
  var nameList = [];
  allNames.each(function(index, element) {
    nameList.push($(this).text().trim());
  });

  // Stats
  var totalArrested = nameList.length;
  var totalIncarcerated = 0;
  var totalBailAmount = 0;
  var under2KTotalBailCharges = 0;
  var under2KTotalBailPersons = 0;
  var under2KTotalCharges = 0;
  var under2KTotalInmates = 0;

  console.log("Starting inmateSearch");

  var duplicateNames = [];
  // Get all inmate names
  console.log("Get all names");
  var allRows = $('#Table1 tr');
  for (var i = 0; i < nameList.length; i++) { // Iterate through all names
    var currentInmate = {};
    allRows.each(function(index, element) { // Iterate through all rows
      currentInmate.name = nameList[i];
      if ($(this).text().trim() == (currentInmate.name) ) { // Store each inmate's rowIndex
        if (duplicateNames.indexOf(currentInmate.name) == -1) { // If the name is new...
          if (currentInmate.rowIndex) { // If we have already assigned a row to this name
            duplicateNames.push(currentInmate.name);
          } else {  // If we haven't yet assigned a row to this name
            currentInmate.inmateNumber = i;
            currentInmate.rowIndex = index;
            currentInmate.dataRows = [];
            inmateList.push(currentInmate);
          }
        } else {
          // console.log("Duplicate name found: " + currentInmate.name);
          // console.log("Duplicates: ", duplicateNames);
          // console.log("Current row: " + index);
          // console.log("Previous inmate: " + inmateList[i-1].name);
          if (index != inmateList[i-1].rowIndex) {
            currentInmate.inmateNumber = i;
            currentInmate.rowIndex = index;
            currentInmate.dataRows = [];
            inmateList.push(currentInmate);
          }
        }
      }
    });
  }

  // Add data rows
  console.log("Get data rows");
  for (var i = 0; i < inmateList.length; i++) {
    // For each inmate, store the previous inmate's data rows
    if (i > 0) { // Skip the first inmate
      var previousInmate = inmateList[i - 1];
      var currentInmate = inmateList[i];
      var startRowIndex = previousInmate.rowIndex + 2; // Skip the column titles
      var endRowIndex = currentInmate.rowIndex;
      for (var j = startRowIndex; j < endRowIndex; j++) { // Iterate through all previous inmate's data rows
        var currentRow = allRows[j];
        previousInmate.dataRows.push(currentRow); // Save each row to the previous inmate
      }
    }
  }
  // Get the last inmate's info
  var lastInmate = inmateList[inmateList.length - 1];
  var startRowIndex = lastInmate.rowIndex + 2; // Skip the column titles
  var endRowIndex = allRows.length;
  for (var j = startRowIndex; j < endRowIndex; j++) { // Iterate through all previous inmate's data rows
    var currentRow = allRows[j];
    lastInmate.dataRows.push(currentRow); // Save each row to the previous inmate
  }

  // Store all inmate results
  for (var i = 0; i < inmateList.length; i++) { // Iterate through all inmates
    var currentInmate = inmateList[i];
    currentInmate.charges = [];
    currentInmate.totalBailAmount = 0;
    var addInmate = true;
    for (var j = 0; j < currentInmate.dataRows.length; j++) { // Iterate over all data rows
      var currentRow = currentInmate.dataRows[j];
      var dateConfined = $(currentRow).find('td:nth-child(1)').text();
      var dateCharged = $(currentRow).find('td:nth-child(2)').text();
      var dateReleased = $(currentRow).find('td:nth-child(3)').text();
      var description = $(currentRow).find('td:nth-child(4)').text();
      var bondType = $(currentRow).find('td:nth-child(5)').text();
      var bailAmountString = $(currentRow).find('td:nth-child(6)').text();
      var courtDocket = $(currentRow).find('td:nth-child(7)').text();
      var daysInJail = $(currentRow).find('td:nth-child(8)').text();

      var currentCharge = {
        dateConfined: dateConfined,
        dateCharged: dateCharged,
        dateReleased: dateReleased,
        description: description,
        bondType: bondType,
        bailAmountString: bailAmountString,
        courtDocket: courtDocket,
        daysInJail: daysInJail
      };
      currentInmate.charges.push(currentCharge);

      // Quick access to release date
      currentInmate.dateReleased = dateReleased;

      // Store all unique crimes
      if (descriptionList.indexOf(description) == -1) {
        var newCrime = {
          name: description
        };
        allCrimes.push(newCrime);
        descriptionList.push(description);
      }

      // Add the current bail amount to the inmate's total
      // Remove $
      bailAmountString = bailAmountString.substring(1);
      // Remove commas
      bailAmountString = bailAmountString.split(",").join("");
      // Convert to Number
      var currentBailAmount = Number(bailAmountString);
      if (currentBailAmount == 'NaN' || isNaN(currentBailAmount)) {
        console.log(currentInmate);
        throw "Could not convert bail amount to a number!";
      }
      // Make note of bail amounts that are less than the bailable limit
      if (currentBailAmount <= bailLimit) {
        under2KTotalBailCharges += currentBailAmount;
        under2KTotalCharges++;
      }
      // Add the current bail amount to the inmate's total
      currentInmate.totalBailAmount += currentBailAmount;
      // Add the current bail amount to the sum of all bail amounts
      totalBailAmount += currentBailAmount;
      if (totalBailAmount == 'NaN' || isNaN(totalBailAmount)) {
        console.log(currentInmate);
        throw "Total Bail Amount is Not a Number";
      }
    }
    // Count the inmates who are not yet released
    if (currentInmate.dateReleased == '[incarcerated]') {
      totalIncarcerated++;
    }
    // Make note of the number of inmates whose total bail is less than the bailable limit
    if (currentInmate.totalBailAmount <= bailLimit) {
      under2KTotalBailPersons += currentInmate.totalBailAmount;
      under2KTotalInmates++;
    }
    // DEBUGGING
    // if (currentInmate.name == 'MCNEIL, ROBERT') {
    //   console.log(inmateList[i-1]);
    //   console.log(currentInmate);
    //   throw "Problem Data";
    // }
  }

  console.log("inmateSearch complete");

  // console.log("Total Arrested: " + totalArrested);
  // console.log("Total Bail Amount: " + totalBailAmount);
  // console.log("Total Incarcerated: " + totalIncarcerated);
  // console.log("Total Bail Amount for all Charges under 2K: " + under2KTotalBailCharges);
  // console.log("Total Bail amount for all Persons with individual bail amount under 2K: " + under2KTotalBailPersons);
  // console.log("Number of individual charges under 2K: " + under2KTotalCharges);
  // console.log("Number of Persons with Total Bail under 2K: " + under2KTotalInmates);

  var inmateDB = {
    inmateList: inmateList,
    crimeList: allCrimes
  };

  return inmateDB;


  // console.log(filteredInmates);
  // console.log(inmateList);

  // var filteredInmates = [];
  // // Check for the inmate's eligibility to be bailed
  // // Remove all inmates with "NO BOND", etc
  // if ( bondType.includes("NO BOND") || bondType.includes("NB") || bondType.includes("[N/A]") ) {
  //   addInmate = false;
  // }
  // if (addInmate) {
  //   filteredInmates.push(currentInmate);
  // }

  // $('.totalArrested').text(totalArrested);
  // $('.totalBailAmount').text(totalBailAmount);
  // $('.totalIncarcerated').text(totalIncarcerated);
  // $('.under2KTotalBailCharges').text(under2KTotalBailCharges);
  // $('.under2KTotalBailPersons').text(under2KTotalBailPersons);
  // $('.under2KTotalCharges').text(under2KTotalCharges);
  // $('.under2KTotalInmates').text(under2KTotalInmates);

  // $('.allCrimes').text(allCrimes);
  //
  // /* Just for fun...sort words in allCrimes */
  // var allWords = {};
  // allCrimes.forEach(function(description) {
  //   var words = description.split(' ');
  //   words.forEach(function(word) {
  //     if (allWords[word]) {
  //       allWords[word]++;
  //     } else {
  //       allWords[word] = 1;
  //     }
  //   })
  // })
  // console.log(allWords);

}
module.exports = inmateSearch;
