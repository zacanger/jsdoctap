#!/usr/bin/env node

// require('babel-register')
// require('babel-polyfill')

const { resolve } = require('path')
const runTests = require('../lib')
const { name, version, description } = require('../package.json')
const c = require('zeelib/lib/colorize').default

const help = () => {
  console.log(`
    ${c.blue(name)} - ${c.blue(version)}
    ${c.blue(description)}
    Usage:
    ${c.green(name + ' some-file.js')}
    ${c.green(name + ' src/*.js')}
  `)
  process.exit(0)
}

const main = (argv) => {
  const first = argv[0]
  if (!first || [ '-h', '--help', '-v', '--version' ].includes(first)) {
    help()
  }

  argv.forEach((a) => {
    const filename = resolve(process.cwd(), a)
    runTests(filename)
  })
}

main(process.argv.slice(2))
