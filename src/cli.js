#!/usr/bin/env node
import cac from 'cac'

const cli = cac()

cli.command('*', {
  desc: 'Take a snapshot',
  examples: [
    'taki https://google.com',
    'taki https://vuejs.org --block-cross-origin --verbose'
  ]
}, async (input, flags) => {
  if (input.length === 0) return cli.showHelp()
  const options = {
    url: input[0],
    ...flags
  }

  if (flags.verbose) {
    process.env.DEBUG = 'taki'
  }

  const html = await require('.')(options)

  console.log(html)
}).option('block-cross-origin', 'Block cross-origin resource')
.option('minify', 'Minify output')
.option('wait', 'Wait for a timeout or certain element to appear')
.option('verbose', 'Output as much info as possible')

cli.parse()
