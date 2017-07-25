import test from 'ava'
import taki from '../'

test('jsdom:main', async t => {
  const html = await taki({
    url: 'http://elm-spa-example.gizra.com/'
  })

  t.snapshot(html)
})

test('jsdom:wait', async t => {
  const html = await taki({
    url: 'http://elm-spa-example.gizra.com/',
    wait: 1000
  })

  t.snapshot(html)
})

test('jsdom:multiple urls', async t => {
  const html = await taki({
    url: [
      'http://elm-spa-example.gizra.com/',
      'http://elm-spa-example.gizra.com/'
    ],
    wait: 1000
  })

  t.snapshot(html)
})

test('jsdom:wait for selector', async t => {
  const html = await taki({
    url: 'https://sao.js.org',
    wait: '#motivation'
  })

  t.snapshot(html)
})

test.serial('chrome', async t => {
  const html = await taki({
    url: 'http://elm-spa-example.gizra.com/',
    browser: 'chrome'
  })

  t.snapshot(html)
})

test.serial('chrome:wait for selector', async t => {
  const html = await taki({
    url: 'https://sao.js.org',
    browser: 'chrome',
    wait: '#motivation'
  })

  t.regex(html, /Motivation/)
})

test.serial('chrome:multiple urls', async t => {
  const html = await taki({
    url: ['https://sao.js.org', 'https://docute.js.org'],
    browser: 'chrome'
  })

  t.snapshot(html)
})
