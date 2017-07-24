const jsdom = require('jsdom')

const defaultResourceFilter = () => true

module.exports = ({
  url,
  wait,
  manually = false,
  resourceFilter = defaultResourceFilter
}) => {
  if (manually && wait) {
    return Promise.reject(
      new Error(
        'You cannot use "delay" if you want to "manually" tell when the app is ready'
      )
    )
  }

  return new Promise((resolve, reject) => {
    jsdom.env({
      url,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      resourceLoader(resource, callback) {
        if (resourceFilter(resource)) {
          resource.defaultFetch(callback)
        } else {
          callback()
        }
      },
      features: {
        FetchExternalResources: ['script'],
        ProcessExternalResources: ['script'],
        SkipExternalResources: false
      },
      virtualConsole: jsdom.createVirtualConsole().sendTo(console),
      created(err, window) {
        if (err) return reject(err)
        if (manually) {
          window.snapshot = () => {
            resolve(window)
          }
        }
      },
      done: (err, window) => {
        if (err) return reject(err)
        if (!manually) {
          setTimeout(() => {
            resolve(window)
          }, wait || 50)
        }
      }
    })
  })
}
