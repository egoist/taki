import puppeteer from 'puppeteer'

async function getHTML(browser, { url, wait, manually }) {
  const page = await browser.newPage()
  await page.goto(url)
  if (wait) {
    await page.waitFor(wait)
  } else if (manually) {
    await page.evaluate(() => {
      return new Promise(resolve => {
        // eslint-disable-next-line no-undef
        window.snapshot = resolve
      })
    })
  }
  return page.content()
}

export default async function (options) {
  const browser = await puppeteer.launch()

  const result = Array.isArray(options) ?
    await Promise.all(options.map(option => getHTML(browser, option))) :
    await getHTML(browser, options)

  await browser.close()
  return result
}
