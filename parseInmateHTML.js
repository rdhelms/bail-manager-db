function inmateSearch($, oldInmates, oldCrimes) {
    var bailLimit = 2000;

    var allInmates = oldInmates;
    var allCrimes = [];
    var newCrimes = [];
    var currentInmate = {};

    console.log("Get all data rows");
    var allRows = $('#Table1 tr');

    try {
        var skipNextRow = false;
        allRows.each(function (index, element) {
            if (!skipNextRow) {
                // If there is no third cell text, we found a name
                if (!$(this).find('td:nth-child(3)').text()) {
                    var name = $(this).find('td:nth-child(1)').text().trim();
                    // First check to see if it's a new name
                    if (!allInmates[name]) {
                        // If it's a new name, create a new entry for them.
                        allInmates[name] = {
                            name: name,
                            totalBailAmount: 0,
                            charges: [],
                            dateReleased: "[incarcerated]"
                        };
                        console.log("Found new name: " + name);
                    }
                    currentInmate = allInmates[name];
                    skipNextRow = true; // Don't collect the data from the title row.
                } else {
                    // If there is text in the third cell, we found a data row
                    var dateConfined = $(this).find('td:nth-child(1)').text();
                    var dateCharged = $(this).find('td:nth-child(2)').text();
                    var dateReleased = $(this).find('td:nth-child(3)').text();
                    var description = $(this).find('td:nth-child(4)').text();
                    var bondType = $(this).find('td:nth-child(5)').text();
                    var bailAmountString = $(this).find('td:nth-child(6)').text();
                    var courtDocket = $(this).find('td:nth-child(7)').text();
                    var daysInJail = $(this).find('td:nth-child(8)').text();
                    var newCharge = {
                        dateConfined: dateConfined,
                        dateCharged: dateCharged,
                        dateReleased: dateReleased,
                        description: description,
                        bondType: bondType,
                        bailAmountString: bailAmountString,
                        courtDocket: courtDocket,
                        daysInJail: daysInJail
                    };
                    var existingCharge = false;
                    currentInmate.charges.forEach(function (charge) {
                        if (charge.dateConfined == dateConfined && charge.dateCharged == dateCharged && charge.description == description && charge.courtDocket == courtDocket && charge.bailAmountString == bailAmountString) {
                            if (charge.dateReleased != dateReleased || charge.bondType != bondType || charge.daysInJail != daysInJail) {
                                console.log("Updating charge for inmate " + currentInmate.name);
                                console.log("Old: ", charge);
                                console.log("New: ", newCharge);
                                charge = newCharge;
                            } else {
                                console.log("Inmate " + currentInmate.name + " already has charge " + description);
                            }
                            existingCharge = true;
                        }
                    });
                    if (!existingCharge) {
                        console.log("Adding charge " + newCharge.description + " to inmate " + currentInmate.name);
                        currentInmate.charges.push(newCharge);
                        // Add the current bail amount to the inmate's total
                        // Remove $
                        bailAmountString = bailAmountString.substring(1);
                        // Remove commas
                        bailAmountString = bailAmountString.split(",").join("");
                        // Convert to Number
                        var currentBailAmount = Number(bailAmountString);
                        if (currentBailAmount == 'NaN' || isNaN(currentBailAmount)) {
                            console.log(currentInmate);
                            console.log("Could not convert bail amount to a number!");
                        }
                        // Add the current bail amount to the inmate's total
                        currentInmate.totalBailAmount += currentBailAmount;
                    }
                    // Collect the most recent dateReleased as the inmate's dateReleased
                    // If the dateReleased values are not the same, and one of them is '[incarcerated]', update the dateReleased
                    if (currentInmate.dateReleased === '[incarcerated]' || dateReleased === '[incarcerated]') {
                        if (currentInmate.dateReleased !== dateReleased) {
                            console.log("Updating dateReleased for " + currentInmate.name + " from " + currentInmate.dateReleased + " to " + dateReleased);
                            currentInmate.dateReleased = dateReleased;
                        }
                        // If neither dateReleased is '[incarcerated]', check to see if current charge's dateReleased is more recent than the inmate's current dateReleased
                    } else if (currentInmate.dateReleased !== undefined && new Date(dateReleased).getTime() > new Date(currentInmate.dateReleased).getTime()) {
                        console.log("Updating dateReleased for " + currentInmate.name + " from " + currentInmate.dateReleased + " to " + dateReleased);
                        currentInmate.dateReleased = dateReleased;
                        // If the inmate has no current dateReleased, set it to be the current charge's
                    } else if (currentInmate.dateReleased === undefined) {
                        console.log("Updating dateReleased for " + currentInmate.name + " from " + currentInmate.dateReleased + " to " + dateReleased);
                        currentInmate.dateReleased = dateReleased;
                    }
                    // Collect the most recent dateCharged as the inmate's dateCharged
                    // Check to see if current charge's dateCharged is more recent than the inmate's current dateCharged
                    if (currentInmate.dateCharged !== undefined && new Date(dateCharged).getTime() > new Date(currentInmate.dateCharged).getTime()) {
                        console.log("Updating dateCharged for " + currentInmate.name + " from " + currentInmate.dateCharged + " to " + dateCharged);
                        currentInmate.dateCharged = dateCharged;
                        // If the inmate has no current dateCharged, set it to be the current charge's
                    } else if (currentInmate.dateCharged === undefined) {
                        currentInmate.dateCharged = dateCharged;
                    }

                    // Add the charge description to the list of crimes if it doesn't already exist
                    if (oldCrimes.indexOf(description) == -1 && newCrimes.indexOf(description) == -1) {
                        console.log("Found new crime: " + description);
                        newCrimes.push(description);
                        allCrimes.push({
                            name: description
                        });
                    }
                }
            } else {
                skipNextRow = false;
            }
        });
    } catch (err) {
        console.log(err);
    }

    var inmateDB = {
        inmateList: allInmates,
        crimeList: allCrimes
    };

    return inmateDB;
}

module.exports = inmateSearch;