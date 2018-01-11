'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var puppeteer = _interopDefault(require('puppeteer'));

function getHTML(browser, ref) {
  var url = ref.url;
  var wait = ref.wait;
  var manually = ref.manually;

  return new Promise(function ($return, $error) {
    var page;
    return browser.newPage().then(function ($await_5) {
      try {
        page = $await_5;
        return page.goto(url).then(function ($await_6) {
          try {
            if (wait) {
              return page.waitFor(wait).then(function ($await_7) {
                try {
                  return $If_2.call(this);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }.bind(this), $error);
            } else {
              if (manually) {
                return page.evaluate(function () { return new Promise(function (resolve) {
                  window.snapshot = resolve;
                }); }).then(function ($await_8) {
                  try {
                    return $If_3.call(this);
                  } catch ($boundEx) {
                    return $error($boundEx);
                  }
                }.bind(this), $error);
              }

              function $If_3() {
                return $If_2.call(this);
              }

              return $If_3.call(this);
            }
            function $If_2() {
              return page.content().then($return, $error);
            }
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      } catch ($boundEx) {
        return $error($boundEx);
      }
    }.bind(this), $error);
  }.bind(this));
}

var index = (function (options) {
  return new Promise(function ($return, $error) {
    var browser, result;
    return puppeteer.launch().then(function ($await_10) {
      try {
        browser = $await_10;
        return new Promise(function ($return, $error) {
          if (Array.isArray(options)) {
            return Promise.all(options.map(function (option) { return getHTML(browser, option); })).then($return, $error);
          }return getHTML(browser, options).then($return, $error);
        }.bind(this)).then(function ($await_13) {
          try {
            result = $await_13;
            return browser.close().then(function ($await_14) {
              try {
                return $return(result);
              } catch ($boundEx) {
                return $error($boundEx);
              }
            }.bind(this), $error);
          } catch ($boundEx) {
            return $error($boundEx);
          }
        }.bind(this), $error);
      } catch ($boundEx) {
        return $error($boundEx);
      }
    }.bind(this), $error);
  }.bind(this));
});

module.exports = index;
