# taki

[![NPM version](https://img.shields.io/npm/v/taki.svg?style=flat)](https://npmjs.com/package/taki) [![NPM downloads](https://img.shields.io/npm/dm/taki.svg?style=flat)](https://npmjs.com/package/taki) [![CircleCI](https://circleci.com/gh/egoist/taki/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/taki/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

## Install

```bash
npm i taki
```

Built on the top of Google's [Puppeteer](https://github.com/GoogleChrome/puppeteer), for a jsdom/chromy version please visit [here](https://github.com/egoist/taki/tree/jsdom-chromy).

## Usage

```js
const taki = require('taki')

// Prerender this page to static HTML
// Wait for 1s since this page renders remote markdown file
taki({ url: 'https://sao.js.org', wait: 1000 })
.then(html => {
  // serialized html string of target url
  console.log(html)
})
```

### Multiplate URLs

```js
taki([
  { url: 'https://sao.js.org' }, 
  { url: 'https://sao.js.org/#/create' }  
]).then(result => {
  // Then the result will an array of html string
})
```

### Manually take snapshot

By default **taki** will take a snapshot of the URL when all resources are loaded, if you have control of the website's source code, you can disable that and manually call `window.snapshot`:

```js
taki({
  url: 'http://my-web.com',
  manually: true
})
```

And in your website's source code:

```diff
fetchSomeData().then(data => {
  this.setState({ data }, () => {
+    window.snapshot && window.snapshot()
  })
})
```

Alternatively, choose your own method to invoke when your app is ready to return HTML:

```js
taki({
  url: 'http://my-web.com',
  manually: 'iamready'
})
```

Then call `window.iamready()` instead of `window.snapshot()` in your app.

### Wait

Wait for specific timeout or a CSS selector to appear in dom.

```js
taki({
  url,
  // Wait for 3000 ms
  wait: 3000,
  // Or wait for <div class="comments"></div> to appear
  wait: '.comments'
})
```

This option will be ignored if [manually](#manually-take-snapshot) is set.

### Minify

Minify HTML.

```js
taki({
  url,
  minify: true
})
```

### Filter resource

We always abort network requests to following types of resource: `stylesheet` `image` `media` `font` since they're not required to render the page. In addtion, you can use `resourceFilter` option to abort specfic type of resource:

```js
taki({
  url,
  /**
   * @param {Object} context
   * @param {string} context.type - Resource type
   * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestresourcetype}
   * @param {string} context.url - Resource URL
   * @see {@link https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requesturl}
   * @returns {boolean} Whether to load this resource
   */
  resourceFilter({ type, url }) {
    // Return true to load the resource, false otherwise.
  }
})
```

You can also use `blockCrossOrigin: true` shortcut to block all cross-origin requests.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**taki** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/taki/contributors)).

> [Website](https://egoist.sh) · GitHub [@egoist](https://github.com/egoist) · Twitter [@_egoistlily](https://twitter.com/_egoistlily)
