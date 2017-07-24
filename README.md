# taki

[![NPM version](https://img.shields.io/npm/v/taki.svg?style=flat)](https://npmjs.com/package/taki) [![NPM downloads](https://img.shields.io/npm/dm/taki.svg?style=flat)](https://npmjs.com/package/taki) [![CircleCI](https://circleci.com/gh/egoist/taki/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/taki/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

## Install

```bash
yarn add taki
```

## Usage

```js
const taki = require('taki')

// Prerender this page to static HTML
// Wait for 1s since this page renders remote markdown file
taki({ url: 'https://sao.js.org', wait: 1000 })
.then(result => {
  // window object of target url
  console.log(result.window)
  // serialized html string of target url
  console.log(result.html)
})
```

### Manually set ready state

If you have control of the website you want to prerender, you can manually call `window.snapshot()` to tell `taki` that your async web page is ready:

```js
// In your app:
fetchSomeData().then(data => {
  this.setState({ data }, () => {
    window.snapshot && window.snapshot()
  })
})
```

### Resource filter

By default we fetch all resources in `script` tag, but you can control which should be excluded:

```js
const URL = require('url')

const url = 'http://example-website.com'

taki({
  url,
  resourceFilter(resource) {
    // Only fetch resources from the same host
    return resource.url.host === URL.parse(url).host
  }
})
```

See the *resource* definition [here](https://github.com/tmpvar/jsdom/blob/master/lib/old-api.md#custom-external-resource-loader).

### Canvas support

Install [canvas](https://npm.im/canvas) or [canvas-prebuilt](https://npm.im/canvas-prebuilt) alongside *taki*.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**taki** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/taki/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
