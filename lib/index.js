const jsdom = require('jsdom')
const snapshot = require('./snapshot')

module.exports = opts => {
  return snapshot(opts).then(window => {
    const html = jsdom.serializeDocument(window.document)
    window.close()
    return html
  })
}
