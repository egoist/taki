import { parse as parseURL } from 'url'
import debug from 'debug'
import pptr, { Browser, Page } from 'puppeteer-core'
import { minify as minifyHTML } from 'html-minifier'
import { findChrome } from './find-chrome'
import { truthy } from './utils'

const debugRequest = debug('taki:request')

const resourceTypeBlacklist = new Set(['stylesheet', 'image', 'media', 'font'])

export type ResourceFilterCtx = { url: string; type: string }

export type { Page, Browser }

export type RequestOptions = {
  url: string
  manually?: string | boolean
  wait?: string | number
  onBeforeRequest?: (url: string) => void
  onAfterRequest?: (url: string) => void
  onCreatedPage?: (page: Page) => void | Promise<void>
  onBeforeClosingPage?: (page: Page) => void | Promise<void>
  minify?: boolean
  resourceFilter?: (ctx: ResourceFilterCtx) => boolean
  blockCrossOrigin?: boolean
  proxy?: string
  headless?: boolean
  sandbox?: boolean
  htmlSelector?: string
}

async function getHTML(browser: Browser, options: RequestOptions) {
  options.onBeforeRequest && options.onBeforeRequest(options.url)
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36 Prerender'
  )
  if (options.onCreatedPage) {
    await options.onCreatedPage(page)
  }
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
  let resolveResult: Function | undefined
  let content: string = ''
  type Result = { content: string }
  const resultPromise = new Promise<Result>(
    (resolve) => (resolveResult = resolve)
  )
  if (options.manually) {
    const functionName =
      typeof options.manually === 'string' ? options.manually : 'snapshot'
    await page.exposeFunction(functionName, (result: any) => {
      resolveResult!(result)
    })
  }
  await page.goto(options.url, {
    waitUntil: options.manually ? 'domcontentloaded' : 'networkidle2',
  })
  let result: Result | undefined
  if (options.manually) {
    result = await resultPromise
  } else if (typeof options.wait === 'number') {
    await page.waitForTimeout(options.wait)
  } else if (typeof options.wait === 'string') {
    await page.waitForSelector(options.wait)
  }
  content = result
    ? result.content
    : options.htmlSelector
    ? await page.evaluate(
        (selector) => document.querySelector(selector).innerHTML,
        [options.htmlSelector]
      )
    : await page.content()
  options.onBeforeClosingPage && (await options.onBeforeClosingPage(page))
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
  return options.minify ? minifyHTML(content, minifyOptions) : content
}

let browser: Browser | undefined

export type BrowserOptions = {
  proxy?: string
  headless?: boolean
  sandbox?: boolean
}

export async function request(options: RequestOptions) {
  if (!browser) {
    browser = await pptr.launch({
      executablePath: findChrome(),
      args: [
        options.proxy && `--proxy-server=${options.proxy}`,
        options.sandbox === false && '--no-sandbox',
      ].filter(truthy),
      headless: options.headless,
    })
  }

  return getHTML(browser, options)
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
