module.exports = (opts = {}) => {
  const browser = opts.browser || 'jsdom'
  if (browser === 'jsdom') {
    return require('./jsdom')(opts)
  } else if (browser === 'chrome') {
    return require('./chrome')(opts)
  }
}
