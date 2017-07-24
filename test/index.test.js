import test from 'ava'
import taki from '../'

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
