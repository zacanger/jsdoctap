#!/usr/bin/env node

require('babel-register')
require('babel-polyfill')

const { resolve } = require('path')
const { run } = require('../lib')
const { name, version, description } = require('../package.json')
const c = require('zeelib/lib/colorize').default

const fail = (err) => {
  console.error(err.message || err)
  process.exit(err.code || 1)
}

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
    const failed = run(filename)

    if (failed) {
      fail(new Error('Tests failed'))
    }
  })
}

main(process.argv.slice(2))
