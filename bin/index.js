#!/usr/bin/env node

const { resolve } = require('path')
const { run } = require('../lib')
const { version } = require('../package.json')

const fail = (err) => {
  console.error(err.message || err)
  process.exit(err.code || 1)
}

const help = () => {
  console.log(`
    jsdoctap version ${version}
    usage:
    jsdoctap some-file.js
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
    } else {
      console.log('Tests passed')
    }
  })
}

main(process.argv.slice(2))
