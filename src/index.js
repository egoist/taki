import puppeteer from 'puppeteer'
import minifier from 'html-minifier'

async function getHTML(
  browser,
  { url, wait = 50, manually, onFetch, onFetched, minify }
) {
  onFetch && onFetch(url)
  const page = await browser.newPage()
  await page.goto(url)
  if (manually) {
    await page.evaluate(() => {
      return new Promise(resolve => {
        // eslint-disable-next-line no-undef
        window[typeof manually === 'string' ? manually : 'snapshot'] = resolve
      })
    })
  } else {
    await page.waitFor(wait)
  }
  const html = await page.content()
  onFetched && onFetched(url)
  const minifyOptions = typeof minify === 'object' ? minify : {
    minifyCSS: true,
    minifyJS: true,
    collapseWhitespace: true,
    decodeEntities: true,
    removeComments: true,
    removeAttributeQuotes: true,
    removeScriptTypeAttributes: true,
    removeRedundantAttributes: true,
    removeStyleLinkTypeAttributes: true
  }
  return minify ?
    minifier.minify(html, minifyOptions) :
    html
}

export default async function (options) {
  const browser = await puppeteer.launch()
  try {
    const result = Array.isArray(options) ?
      await Promise.all(options.map(option => getHTML(browser, option))) :
      await getHTML(browser, options)
    await browser.close()
    return result
  } catch (err) {
    await browser.close()
    throw err
  }
}
