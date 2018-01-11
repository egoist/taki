import test from 'ava'
import taki from '../src'

test('main', async t => {
  const html = await taki({
    url: 'http://elm-spa-example.gizra.com/'
  })
  t.snapshot(html)
})

test('wait', async t => {
  const html = await taki({
    url: 'http://elm-spa-example.gizra.com/',
    wait: 1000
  })

  t.snapshot(html)
})

test('multiple urls', async t => {
  const html = await taki([
    { url: 'http://elm-spa-example.gizra.com/', wait: 1000 },
    { url: 'http://elm-spa-example.gizra.com/', wait: 1000 }
  ])

  t.snapshot(html)
})

test('wait for selector', async t => {
  const html = await taki({
    url: 'https://84onq72m32.codesandbox.io/',
    wait: '#bar'
  })

  t.snapshot(html)
})

test('manually', async t => {
  const html = await taki({
    url: 'https://84onq72m32.codesandbox.io/',
    manually: true
  })

  t.snapshot(html)
})
