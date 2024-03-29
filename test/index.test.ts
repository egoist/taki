import { join } from 'path'
import { createServer, Server } from 'http'
import test from 'ava'
import sirv from 'sirv'
import getPort from 'get-port'
import { request, cleanup } from '../src'

function serve() {
  const handler = sirv(join(__dirname, 'server'))
  return createServer((req, res) => {
    handler(req, res)
  })
}

let server: Server
let port: number

test.before(async () => {
  server = serve()
  port = await getPort()
  server.listen(port)
})

test.after.always(async () => {
  server && server.close()
  await cleanup()
})

test('basic', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/basic.html`,
    sandbox: false,
  })
  t.snapshot(html)
})

test('minify', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/basic.html`,
    minify: true,
    sandbox: false,
  })
  t.snapshot(html)
})

test('wait for selector', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/wait-for-selector.html`,
    wait: '#bar',
    sandbox: false,
  })
  t.snapshot(html)
})

test('manually', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/manually.html`,
    manually: true,
    sandbox: false,
  })

  t.snapshot(html)
})

test('custom html selector', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/html-selector.html`,
    htmlSelector: '#app',
    sandbox: false,
  })

  t.snapshot(html)
})
