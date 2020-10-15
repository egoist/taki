import { parse as parseURL } from 'url'
import debug from 'debug'
import pptr, { Browser, Page } from 'puppeteer-core'
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
  onCreatedPage?: (page: Page) => void | Promise<void>
  onBeforeClosingPage?: (page: Page) => void | Promise<void>
  minify?: boolean
  resourceFilter?: (ctx: ResourceFilterCtx) => boolean
  blockCrossOrigin?: boolean
  chromePath?: string
}

async function getHTML(browser: Browser, options: TakiOptions) {
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
  let resolveFunction: Function | undefined
  let content: string = ''
  type Result = { content: string }
  const promise = new Promise<Result>((resolve) => (resolveFunction = resolve))
  if (options.manually) {
    const functionName =
      typeof options.manually === 'string' ? options.manually : 'snapshot'
    await page.exposeFunction(functionName, (result) => {
      resolveFunction!(result)
    })
  }
  await page.goto(options.url, {
    waitUntil: options.manually ? 'domcontentloaded' : 'networkidle2',
  })
  let result: Result | undefined
  if (options.manually) {
    result = await promise
  } else if (options.wait === 'number') {
    await page.waitFor(options.wait)
  } else if (options.wait === 'string') {
    await page.waitForSelector(options.wait)
  }
  content = result ? result.content : await page.content()
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

export async function request(options: TakiOptions): Promise<string>
export async function request(options: TakiOptions[]): Promise<string[]>

export async function request(options: TakiOptions | TakiOptions[]) {
  if (!browser) {
    let chromePath;
    if (Array.isArray(options)) {
      // get first occurrences of chromePath
      const optChromePath = options.find(opt => opt.chromePath);
      if (optChromePath) chromePath = optChromePath.chromePath;
    } else {
      chromePath = options.chromePath;
    }

    browser = await pptr.launch({
      executablePath: findChrome(chromePath),
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
