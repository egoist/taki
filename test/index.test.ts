import { join } from 'path'
import { createServer, Server } from 'http'
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

beforeAll(async () => {
  server = serve()
  port = await getPort()
  server.listen(port)
})

afterAll(() => {
  server && server.close()
  cleanup()
})

test('basic', async () => {
  const html = await request({
    url: `http://localhost:${port}/basic.html`,
  })
  expect(html).toMatchInlineSnapshot(`
    "<html><head></head><body><h1 id=\\"title\\">hello world</h1>

    <script>
      function main() {
        document.getElementById('title').textContent += ' world'
      }

      main()
    </script>

    <style>
      #title {
        color: red;
      }
    </style>
    </body></html>"
  `)
})

test('minify', async () => {
  const html = await request({
    url: `http://localhost:${port}/basic.html`,
    minify: true,
  })
  expect(html).toMatchInlineSnapshot(
    `"<html><head></head><body><h1 id=title>hello world</h1><script>function main(){document.getElementById(\\"title\\").textContent+=\\" world\\"}main()</script><style>#title{color:red}</style></body></html>"`
  )
})

test('wait for selector', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/wait-for-selector.html`,
    wait: '#bar',
  })
console.log(html)
  expect(html).toMatchInlineSnapshot(
    `"<html><head></head><body>foo<div id=\\"bar\\">bar</div></body></html>"`
  )
})

test('manually', async (t) => {
  const html = await request({
    url: `http://localhost:${port}/manually.html`,
    manually: true,
  })

  expect(html).toMatchInlineSnapshot(
    `"<html><head></head><body>foo</body></html>"`
  )
})
