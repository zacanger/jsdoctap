#!/usr/bin/env node

const { resolve } = require('path')
const runTests = require('../lib')
const glob = require('glob')
const { name, version, description } = require('../package.json')
const c = require('zeelib/lib/colorize')
const findIndices = require('zeelib/lib/find-indices')
const keep = require('zeelib/lib/keep')

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

const srt = (a, b) => a - b
const inc = (a) => a + 1

const main = (argv) => {
  const first = argv[0]
  if (!first || [ '-h', '--help', '-v', '--version' ].includes(first)) {
    help()
  }

  const ignores = findIndices('-i', argv)
    .concat(findIndices('--ignore', argv))
    .sort(srt)
    .map(inc)

  const ignore = keep(argv.map((a, i) => ignores.includes(i) && a))

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
