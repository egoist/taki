import { Server, createServer } from 'http'
import test from 'ava'
import polka from 'polka'
import { taki } from '../src'

let server: Server | undefined
const PORT = 3008

const getURL = (path: string) => `http://localhost:${PORT}${path}`

test.before(() => {
  const router = polka()
  router.get('/render-js', (req, res) => {
    res.end(`
    <div id="app"></div>
    <script>
    document.getElementById('app').innerHTML = 'hello js'
    </script>
    `)
  })
  router.get('/minify', (req, res) => {
    res.end(`
    <div id="app">
      hello
    </div>
    <script>
    function foo() {
      document.getElementById('app').innerHTML = 'hello js'
    }
    foo()
    </script>
    `)
  })
  router.get('/manually', (req, res) => {
    res.end(`
      <script>
      setTimeout(() => {
        document.write('manually snapshot')
        window.snapshot()
      }, 500)
      </script>
      `)
  })
  server = createServer(router.handler as any)
  server.listen(PORT)
})

test.after(() => {
  server && server.close()
})

test('main', async (t) => {
  const html = await taki({
    url: getURL('/render-js'),
  })
  t.snapshot(html)
})

test('minify', async (t) => {
  const html = await taki({
    url: getURL('/minify'),
    minify: true,
  })
  t.snapshot(html)
})

test('multiple urls', async (t) => {
  const html = await taki([
    { url: getURL('/render-js') },
    { url: getURL('/render-js') },
  ])

  t.snapshot(html)
})

test('manually', async (t) => {
  const html = await taki({
    url: getURL('/manually'),
    manually: true,
  })

  t.snapshot(html)
})
