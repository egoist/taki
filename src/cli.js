#!/usr/bin/env node
import fs from 'fs'
import cac from 'cac'

const cli = cac()

cli.command('*', {
  desc: 'Take a snapshot',
  examples: [
    'taki https://google.com --output out.html',
    'taki https://vuejs.org --block-cross-origin --verbose'
  ]
}, async (input, flags) => {
  if (input.length === 0) return cli.showHelp()
  const url = input[0]
  const options = {
    url: /^https?:\/\//.test(url) ? url : `http://${url}`,
    ...flags
  }

  if (flags.verbose) {
    process.env.DEBUG = 'taki,taki:*'
  }

  const debug = require('debug')('taki')
  const html = await require('.')(options)

  if (typeof flags.output === 'string') {
    debug(`Write to ${flags.output}`)
    fs.writeFileSync(flags.output, html, 'utf8')
  } else {
    console.log(html)
  }
}).option('block-cross-origin', 'Block cross-origin resource')
.option('minify', 'Minify output')
.option('wait', 'Wait for a timeout or certain element to appear')
.option('output', {
  desc: 'Redirect output to a file',
  alias: 'o'
})
.option('verbose', 'Output as much info as possible')

cli.parse()
