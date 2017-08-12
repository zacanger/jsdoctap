const path = require('path')
const program = require('commander')
const jsdoctest = require('../..')
const packageJson = require('../../package.json')

/**
 * The main command-line utility's entry point.
 *
 * @param {Array.<String>} The `process.argv` array.
 */

exports.run = function (argv) {
  program
    .usage('[options] [FILES...]')
    .version(packageJson.version)

  program.parse(argv)

  if (program.args.length === 0) {
    return program.help()
  }

  // Base test running case
  for (let i = 0, len = program.args.length; i < len; i++) {
    const filename = path.resolve(process.cwd(), program.args[i])
    const failed = jsdoctest.run(filename)

    if (failed) {
      exports._fail(new Error('Tests failed'))
    } else {
      console.log('Tests passed')
    }
  }
}

/**
 * Prints an error to stderr and exits.
 */

exports._fail = function fail (err) {
  console.error(err.message || err)
  process.exit(err.code || 1)
}
