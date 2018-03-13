import puppeteer from 'puppeteer'
import minifier from 'html-minifier'

const resourceTypeBlacklist = new Set(['stylesheet', 'image', 'media', 'font'])

async function getHTML(
  browser,
  { url, wait, manually, onFetch, onFetched, minify, resourceFilter }
) {
  onFetch && onFetch(url)
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    const type = interceptedRequest.resourceType()
    const url = interceptedRequest.url()
    if (resourceTypeBlacklist.has(type)) {
      return interceptedRequest.abort()
    }
    if (resourceFilter && !resourceFilter({ url, type })) {
      return interceptedRequest.abort()
    }
    return interceptedRequest.continue()
  })
  await page.goto(url, {
    waitUntil: manually ? 'domcontentloaded' : 'networkidle2'
  })
  if (manually) {
    await page.evaluate(() => {
      return new Promise(resolve => {
        // eslint-disable-next-line no-undef
        window[typeof manually === 'string' ? manually : 'snapshot'] = resolve
      })
    })
  } else if (wait) {
    await page.waitFor(wait)
  }
  const html = await page.content()
  await page.close()
  onFetched && onFetched(url)
  const minifyOptions =
    typeof minify === 'object' ?
      minify :
    {
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
  return minify ? minifier.minify(html, minifyOptions) : html
}

async function taki(options, { browser, shouldCloseBrowser = true } = {}) {
  browser = browser || (await puppeteer.launch())

  try {
    const result = Array.isArray(options) ?
      await Promise.all(options.map(option => getHTML(browser, option))) :
      await getHTML(browser, options)
    if (shouldCloseBrowser) {
      await browser.close()
    }
    return result
  } catch (err) {
    if (shouldCloseBrowser) {
      await browser.close()
    }
    throw err
  }
}

export default taki
