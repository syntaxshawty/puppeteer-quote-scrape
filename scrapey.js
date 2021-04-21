const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  /* Initiate the Puppeteer browser */
  const browser = await puppeteer.launch({
    headless: false,
    // slowMo: 50,
  });
  const page = await browser.newPage();

  //goes to page waits until no more network requests
  await page.goto("http://quotes.toscrape.com/", {
    waitUntil: "networkidle2",
  });
  //waits until specific selector has loaded on page
  await page.waitForSelector("body");

  //navigate to login page
  await page.click(".col-md-4 a");

  //complete login form
  await page.waitForSelector("form");
  await page.focus("#username");
  await page.keyboard.type("shinji.ikari@email.com");

  await page.focus("#password");
  await page.keyboard.type("123");
  await page.keyboard.press("Enter");
  await page.waitForNavigation("networkidle2");

  // let quotes = [];
  for (let i = 1; i < 4; i++) {
    //get all quotes on one page
    let data = await page.evaluate(() => {
      let quoteDivs = document.querySelectorAll(".quote");
      let quotes = [];
      quoteDivs.forEach((quote) => {
        let text = quote.querySelector(".text").innerHTML;
        let author = quote.querySelector(".author").innerHTML;
        quotes.push({ text, author });
      });

      return quotes;
    });

    /* Outputting what we scraped */
    // console.log(data);
    let dataAsText = "";
    data.forEach((quote) => {
      dataAsText += `${quote.text} \n ${quote.author} \n\n`;
    });
    console.log(dataAsText);
    fs.appendFileSync("TopQuotes.txt", dataAsText);

    //scroll to the bottom of the page and go to next page
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await page.waitForSelector(".pager");
    await page.click(".next a");
  }

  await browser.close();
})();
