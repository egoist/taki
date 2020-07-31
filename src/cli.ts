#!/usr/bin/env node
import fs from 'fs'
import cac from 'cac'

const cli = cac('taki')

cli
  .command('[url]', 'Take a snapshot')
  .option('--block-cross-origin', 'Block cross-origin resource')
  .option('--minify', 'Minify output')
  .option('--wait', 'Wait for a timeout or certain element to appear')
  .option('--no-sandbox', 'Disable Chrome sandbox')
  .option('-o, --output', 'Redirect output to a file')
  .option('-V, --verbose', 'Output as much info as possible')
  .action(async (url, flags) => {
    if (!url) return cli.outputHelp()

    const options = {
      url: /^https?:\/\//.test(url) ? url : `http://${url}`,
      ...flags,
    }

    if (flags.verbose) {
      process.env.DEBUG = 'taki,taki:*'
    }

    const debug = require('debug')('taki')
    const html = await import('.').then((res) =>
      res.taki(
        {
          url,
          blockCrossOrigin: flags.blockCrossOrigin,
          minify: flags.minify,
          wait: flags.wait,
        },
        {
          sandbox: flags.sandbox,
        },
      ),
    )

    if (typeof flags.output === 'string') {
      debug(`Write to ${flags.output}`)
      fs.writeFileSync(flags.output, html, 'utf8')
    } else {
      console.log(html)
    }
  })

cli.parse()
