# Summary
* Run the following cmd to update the database:
```
node updateDBCasper.js
```
* Running the above command does the following:
  * Spawns a child process: `casperjs/getInmates30day.js`, which does the following:
    * Gets the raw html from http://www2.durhamcountync.gov/sheriff/ips/default.aspx with the "30 day" option selected
    * Streams the html to the child process' stdout
  * Reads the stdout data from the child process
  * Uses the jquery node module to analyze the page's html in `inmateSearch.js`, which does the following:
    * Read through all the table rows and do the following:
      * If the row is a name row, set that name to be the current name being updated, and skip the next row (title row).
      * If the row is not a name row, add it as a data row to the current name, and update the inmate's bail amount, etc.
      * If a data row contains a unique crime description, add it to the list of crimes.
    * Output a full list of inmates and a full list of crimes.
  * Use the list of inmates and the list of crimes to update the database using `inmateDB.js`, which does the following:
    * Option 1: Get the whole list of inmates from the db, compare to the list of inmates to be updated, create an array of all new inmates, and then update all of them in the database at once.
    * Option 2: Find each inmate in the database one at a time, comparing and updating as needed. (probably preferable, if database doesn't complain about too many queries in a short amount of time).
