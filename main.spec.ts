import { test, expect } from "@playwright/test";

// Count of numbers to generate
const LENGTH = 7;

// Target URL to start at i.e.
// https://www.thelott.com/oz-lotto/results
// https://www.thelott.com/powerball/results
const TARGET = 'https://www.thelott.com/powerball/results';

test("test", async ({ page }) => {
  await page.goto(TARGET);

  // Generate random pick  
  const pick = getPick();
  console.log(`Your pick is ${pick}`);

  // Search until a match is found
  if (await search(page, pick)) {
    console.log(`Pick ${pick} has already occurred`);
    return;
  }

  // If no match is found, we have a winner
  console.log(`Pick ${pick} has not already occurred - use it.`);
});

async function search(page, pick) {

  // Array of months to query
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Array of years to query
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  // Iterate over the months for each year
  for (let i = 0; i < years.length; i++) {
    for (let j = 0; j < months.length; j++) {
      let year = years[i];
      let month = months[j];
      console.log(`Selecting ${month} of ${year}`);

      // Bounds check
      const d = new Date();
      let m = d.getMonth() + 1; // ...Months are zero-indexed...
      let y = d.getFullYear();

      let monthByIndex = months.indexOf(month) + 1;

      if ( monthByIndex > m
        && year >= y ) {
          return false;
      }
   
      // Select target date
      await page
        .locator('[data-test-id="results-search-month"]')
        .selectOption(month.toString());

      await page
        .locator('[data-test-id="results-search-year"]')
        .selectOption({ label: year.toString() });

      await page
        .locator('[data-test-id="button-find"]')
        .click();
 
      await page.waitForTimeout(1000); // waits for 1 seconds

      const texts = await page
        .locator(".au-target.number span")
        .allInnerTexts();

      if(year === 2018
        && month === "April") {
          console.log('uh oh');
          break;
        }

      // Powerball only -
      // Some months have 6 numbers and 4 events (24)
      // Some months have 6 numbers and 5 event (30)
      // Some months have 7 numbers and 4 events (28)
      // Some months have 7 numbers and 5 events (35)

      const numberWinningNumbers = texts.length;
      if(numberWinningNumbers != 30
        && numberWinningNumbers != 24
        && numberWinningNumbers != 35
        && numberWinningNumbers != 28
        && numberWinningNumbers != 21) {
          console.log(`numberWinningNumbers ${numberWinningNumbers}`);
      }

      let valuesPerSet = 0;
      let loop = 0;
      if(numberWinningNumbers === 24) {
        valuesPerSet = 6;
        loop = 4;
      } else if(numberWinningNumbers === 28) {
        valuesPerSet = 7;
        loop = 4;
      } else if(numberWinningNumbers === 30) {
        valuesPerSet = 6;
        loop = 5;
      } else if(numberWinningNumbers === 35) {
        valuesPerSet = 7;
        loop = 5;
      } else if(numberWinningNumbers === 21) {
        valuesPerSet = 7;
        loop = 3;
      }

      // For each set of winning numbers
      for (let i = 0; i < loop; i++) {
        // Remove the first valuesPerSet as our winning numbers
        const take = texts.splice(0, valuesPerSet);

        // Convert to int and sort
        const compareWith = take.map(toNumber).sort((a, b) => a - b);
        console.log(`Compare ${pick} against ${compareWith}`);
        if (match(pick, compareWith)) {
          return true;
        }
      }
    }
  }

  return false;
}

function getRandomInt(max) {

  const r = Math.random();
  const f = Math.floor(r * max);

  return f;
}

function toNumber(value) {
  return Number(value);
}

function getPick() {

  let pick: number[] = [];
  while(pick.length < LENGTH) {
    const r = getRandomInt(35);

    if (r > 0
      && !pick.includes(r)) {
        pick.push(r);
    }
  }

  return pick.sort((a, b) => a - b);
}

function match(pick, compareWith) {

  if (JSON.stringify(pick) === JSON.stringify(compareWith)) {
    return true;
  }

  return false;
}
