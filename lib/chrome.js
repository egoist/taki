const Chromy = require('chromy')

module.exports = ({ url, wait = 50, manually = false }) => {
  const chromy = new Chromy()
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
    return (
      new XMLSerializer().serializeToString(document.doctype) +
      document.documentElement.outerHTML
    )
  })

  return instance
    .result(_html => {
      html = _html
    })
    .end()
    .then(() => chromy.close())
    .then(() => html)
}
