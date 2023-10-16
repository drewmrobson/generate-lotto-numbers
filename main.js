import { test, expect } from '@playwright/test';

// TODO
// Iterate over the historical values of Powerball
// and generate a set of numbers never previously used

test('test', async ({ page }) => {

    // Search until a match is found
    // If no match is found, we have a winner
    while (true) {
        const pick = getPick();
        console.log(`Your pick is ${pick}`);

        if(await search(page, pick)) {
            console.log("No pick found");
            break;
        }

        console.log("PICK FOUND");
    }
});

async function search(page, pick) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "September", "October", "November", "December"]
    const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    
    for (let i = 0; i < years.length; i++) {
        for (let j = 0; j < months.length; j++) {
            let year = years[i];
            let month = months[j];
            console.log(`Selecting ${month} of ${year}`)

            // Get winning numbers from site
            await page.goto('https://www.thelott.com/powerball/results');
            await page.locator('[data-test-id="results-search-month"]').selectOption(month);
            await page.locator('[data-test-id="results-search-year"]').selectOption(year);
            await page.locator('[data-test-id="button-find"]').click();

            await page.waitForSelector('.au-target.number')
            const texts = await page.locator('.au-target.number span').allInnerTexts();
            var allWinningNumbers = texts.length;
            var loops = allWinningNumbers / 7;

            // For each set of winning numbers
            for (let i = 0; i < loops; i++) {
                // Remove the first 7 as our winning numbers
                const take = texts.splice(0, 7);
                // Convert to int and sort
                const compareWith = take.map(toNumber).sort((a, b) => (a - b));
                
                if( match(pick, compareWith)) {
                    return;
                }
            }
        }
    }
}

function getRandomInt(max) {
return Math.floor(Math.random() * max);
}
  
function toNumber(value) {
    return Number(value);
}

function getPick() {
    var pick = [
        getRandomInt(35),
        getRandomInt(35),
        getRandomInt(35),
        getRandomInt(35),
        getRandomInt(35),
        getRandomInt(35),
        getRandomInt(35)
    ].sort((a, b) => (a - b));
}

function match(pick, compareWith) {
    if ( JSON.stringify( pick ) === JSON.stringify( compareWith )) {
        return true;
    }

    return false;
}