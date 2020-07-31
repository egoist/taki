import { parse as parseURL } from 'url'
import debug from 'debug'
import puppeteer from 'puppeteer-core'
import minifier from 'html-minifier'
import { findChrome } from './find-chrome'

const debugRequest = debug('taki:request')

const resourceTypeBlacklist = new Set(['stylesheet', 'image', 'media', 'font'])

async function getHTML(
  browser: puppeteer.Browser,
  {
    url,
    wait,
    manually,
    onFetch,
    onFetched,
    minify,
    resourceFilter,
    blockCrossOrigin,
  }: Options,
) {
  onFetch && onFetch(url)
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36 Prerender',
  )
  page.on('request', (interceptedRequest) => {
    const type = interceptedRequest.resourceType()
    const resourceURL = interceptedRequest.url()
    const next = () => {
      debugRequest(`Fetched: ${resourceURL}`)
      interceptedRequest.continue()
    }
    const abort = () => {
      debugRequest(`Aborted: ${resourceURL}`)
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
    // waitUntil: manually ? 'domcontentloaded' : 'networkidle2',
  })
  if (manually) {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        ;(window as any)[
          typeof manually === 'string' ? manually : 'snapshot'
        ] = resolve
      })
    })
  } else if (typeof wait === 'number') {
    await page.waitFor(wait)
  } else if (typeof wait === 'string') {
    await page.waitForSelector(wait)
  }
  const html = await page.content()
  await page.close()
  onFetched && onFetched(url)
  const minifyOptions =
    typeof minify === 'object'
      ? minify
      : {
          minifyCSS: true,
          minifyJS: true,
          collapseWhitespace: true,
          decodeEntities: true,
          removeComments: true,
          removeAttributeQuotes: true,
          removeScriptTypeAttributes: true,
          removeRedundantAttributes: true,
          removeStyleLinkTypeAttributes: true,
        }
  return minify ? minifier.minify(html, minifyOptions) : html
}

export type Options = {
  url: string
  wait?: string | number
  manually?: boolean | string
  onFetch?: any
  onFetched?: any
  minify?: boolean
  resourceFilter?: any
  blockCrossOrigin?: boolean
}

export type ExtraOptions = {
  browser?: puppeteer.Browser
  shouldCloseBrowser?: boolean
  args?: string[]
  sandbox?: boolean
}

async function taki(
  options: Options,
  extraOptions?: ExtraOptions,
): Promise<string>

async function taki(
  options: Options[],
  extraOptions?: ExtraOptions,
): Promise<string[]>

async function taki(
  options: Options | Options[],
  extraOptions: ExtraOptions = {},
) {
  const browser =
    extraOptions.browser ||
    (await puppeteer.launch({
      executablePath: findChrome(),
      args: [
        ...(extraOptions.args || []),
        ...(extraOptions.sandbox === false
          ? ['--no-sandbox', '--disable-setuid-sandbox']
          : []),
      ],
    }))
  const shouldCloseBrowser = extraOptions.shouldCloseBrowser !== false

  try {
    const result = Array.isArray(options)
      ? await Promise.all(options.map((option) => getHTML(browser, option)))
      : await getHTML(browser, options)
    if (shouldCloseBrowser) {
      debugRequest(`Closing browser`)
      await browser.close()
    }
    return result
  } catch (error) {
    if (shouldCloseBrowser) {
      await browser.close()
    }
    throw error
  }
}

export { taki }
