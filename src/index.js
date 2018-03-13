import { parse as parseURL } from 'url'
import debug from 'debug'
import puppeteer from 'puppeteer'
import minifier from 'html-minifier'

const log = debug('taki')

const resourceTypeBlacklist = new Set(['stylesheet', 'image', 'media', 'font'])

async function getHTML(
  browser,
  { url, wait, manually, onFetch, onFetched, minify, resourceFilter, blockCrossOrigin }
) {
  onFetch && onFetch(url)
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', interceptedRequest => {
    const type = interceptedRequest.resourceType()
    const resourceURL = interceptedRequest.url()
    const next = () => {
      log(`Fetch resource: ${resourceURL}`)
      interceptedRequest.continue()
    }
    const abort = () => {
      log(`Abort resource: ${resourceURL}`)
      return interceptedRequest.abort()
    }
    if (blockCrossOrigin && parseURL(resourceURL).host !== parseURL(url).host) {
      return abort()
    }
    if (resourceTypeBlacklist.has(type)) {
      return abort()
    }
    if (resourceFilter && !resourceFilter({ url: resourceURL, type })) {
      return abort()
    }
    return next()
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
