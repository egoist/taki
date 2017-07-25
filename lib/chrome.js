const Chromy = require('chromy')
const series = require('promise.series')
const { handleEvents } = require('./utils')

function fetch({ url, wait = 50, manually = false, onStart, onEnd }, chromy) {
  handleEvents(onStart, url)

  let html
  let instance = chromy.chain().goto(url)

  if (manually) {
    instance = instance
      .evaluate(() => {
        window.snapshot = () => {
          const div = document.createElement('div')
          div.id = '__taki__'
          document.body.appendChild(div)
        }
      })
      .wait('__taki__')
      .evaluate(() => {
        const div = document.getElementById('__taki__')
        div.parentNode.removeChild(div)
      })
  } else {
    instance = instance.wait(wait)
  }

  instance = instance.evaluate(() => {
    const doctype = document.doctype
      ? new XMLSerializer().serializeToString(document.doctype)
      : ''

    return doctype + document.documentElement.outerHTML
  })

  return instance
    .result(_html => {
      html = _html
    })
    .end()
    .then(() => handleEvents(onEnd, url))
    .then(() => html)
}

module.exports = opts => {
  const chromy = new Chromy()

  const handleResult = result => {
    return chromy.close().then(() => result)
  }

  const handleError = err => {
    if (chromy && chromy.close) {
      chromy.close()
    }
    throw err
  }

  if (Array.isArray(opts.url)) {
    return series(
      opts.url.map(url => () => {
        return fetch(Object.assign({}, opts, { url }), chromy)
      })
    ).then(handleResult, handleError)
  }

  return fetch(opts, chromy).then(handleResult, handleError)
}
