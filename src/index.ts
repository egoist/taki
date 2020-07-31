import { parse as parseURL } from 'url'
import debug from 'debug'
import pptr, { Browser } from 'puppeteer-core'
import { minify as minifyHTML } from 'html-minifier'
import { findChrome } from './find-chrome'

const debugRequest = debug('taki:request')

const resourceTypeBlacklist = new Set(['stylesheet', 'image', 'media', 'font'])

export type ResourceFilterCtx = { url: string; type: string }

export type TakiOptions = {
  url: string
  manually?: string | boolean
  wait?: string | number
  onBeforeRequest?: (url: string) => void
  onAfterRequest?: (url: string) => void
  minify?: boolean
  resourceFilter?: (ctx: ResourceFilterCtx) => boolean
  blockCrossOrigin?: boolean
}

async function getHTML(browser: Browser, options: TakiOptions) {
  options.onBeforeRequest && options.onBeforeRequest(options.url)
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36 Prerender'
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
    if (
      options.blockCrossOrigin &&
      parseURL(resourceURL).host !== parseURL(options.url).host
    ) {
      return abort()
    }
    if (resourceTypeBlacklist.has(type)) {
      return abort()
    }
    if (
      options.resourceFilter &&
      !options.resourceFilter({ url: resourceURL, type })
    ) {
      return abort()
    }
    return next()
  })
  const response = await page.goto(options.url, {
    waitUntil: options.manually ? 'domcontentloaded' : 'networkidle2',
  })
  if (!response) {
    return
  }
  if (options.manually) {
    await page.evaluate(
      (manually) => {
        return new Promise((resolve) => {
          // @ts-ignore
          window[typeof manually === 'string' ? manually : 'snapshot'] = resolve
        })
      },
      [options.manually]
    )
  } else if (options.wait === 'number') {
    await page.waitFor(options.wait)
  } else if (options.wait === 'string') {
    await page.waitForSelector(options.wait)
  }
  const headers = response.headers()
  const type = headers['content-type']
  const content = await response.text()
  await page.close()
  options.onAfterRequest && options.onAfterRequest(options.url)
  const minifyOptions =
    typeof options.minify === 'object'
      ? options.minify
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
  return options.minify && type.includes('text/html')
    ? minifyHTML(content, minifyOptions)
    : content
}

let browser: Browser | undefined

export async function request(options: TakiOptions): Promise<string>
export async function request(options: TakiOptions[]): Promise<string[]>

export async function request(options: TakiOptions | TakiOptions[]) {
  if (!browser) {
    browser = await pptr.launch({
      executablePath: findChrome(),
      // headless: false,
    })
  }

  try {
    const result = Array.isArray(options)
      ? await Promise.all(options.map((option) => getHTML(browser!, option)))
      : await getHTML(browser, options)
    return result
  } catch (error) {
    throw error
  }
}

export async function cleanup() {
  if (browser) {
    await browser.close()
    browser = undefined
  }
}

export function getBrowser() {
  return browser
}
