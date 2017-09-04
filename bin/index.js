#!/usr/bin/env node

const { resolve } = require('path')
const runTests = require('../lib')
const glob = require('glob')
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
  let ignore
  if (!first || [ '-h', '--help', '-v', '--version' ].includes(first)) {
    help()
  }

  if ([ '--ignore', '-i' ].includes(first)) {
    ignore = argv[1]
    argv = argv.slice(2)
  }

  argv.forEach((a) => {
    glob(a, { ignore }, (err, files) => {
      const f = files[0]
      if (f) {
        const filename = resolve(process.cwd(), f)
        runTests(filename)
      }
    })
  })
}

main(process.argv.slice(2))
