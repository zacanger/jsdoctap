const fs = require('fs')
const path = require('path')
const dox = require('dox')
const _ = require('lodash')
const commentParser = require('./comment-parser')
const getExampleCode = require('./get-example-code')
const util = require('./util')

const escapeString = getExampleCode.escapeString

/**
 * Runs jsdoctests in some file, and reports the results to the command-line.
 */

exports.run = function jsdoctest$run (filename) {
  require('should')
  let content = fs.readFileSync(filename, 'utf8')

  const jsdocTests = exports.getJsdoctests(content)
  content += _.map(jsdocTests, exports.toJsdocRegister).join('')

  global.__registerTest = exports.registerTest
  module._compile(util.stripBOM(content), filename)
  delete global.__registerTest

  return exports.runRegistered()
}

/**
 * Parses "jsdoctests" out of a file's contents and returns them. These are
 * `dox` outputted `comment` nodes, overloaded with an `examples` field which
 * adds `testCase` and `expectedResult` pairs to them.
 */

exports.getJsdoctests = function jsdoctest$getJsdoctests (content) {
  const parsedContent = dox.parseComments(content)
  const functionComments = _.filter(parsedContent, function (c) {
    return c.ctx && (c.ctx.type === 'method' || c.ctx.type === 'function')
  })

  const comments = _.map(functionComments, function (comment) {
    const exampleNodes = _.filter(comment.tags, { type: 'example' })
    const examples = _.flatten(_.map(exampleNodes, function (exampleNode) {
      return commentParser.run(exampleNode.string)
    }))

    comment.examples = examples
    return examples.length ? comment : undefined
  })

  const ret = _.compact(comments)
  ret.source = parsedContent
  return ret
}

let tests = []

/**
 * Registers a test case to be run by the runner
 */

exports.registerTest = function jsdoctest$registerTest (id, fn) {
  tests.push({ id, fn })
}

/**
 * Runs test cases accumulated in the `tests` array.
 */

exports.runRegistered = function () {
  let failed = false

  _.each(tests, function (test) {
    console.log(test.id)
    try {
      test.fn()
    } catch (err) {
      console.error(err.toString())
      failed = true
    }
  })

  return failed
}

/**
 * Compiles a jsdoc comment `dox` comment overloaded with the `examples` node to
 * the internal test suite registering code.
 */

exports.toJsdocRegister = function jsdoctest$toJsdocRegister (comment) {
  var baseId = comment.ctx.name + ' - '
  var compiled = _.map(comment.examples, function (example) {
    var id = escapeString(baseId) +
             escapeString(example.testCase) + ' => ' +
             escapeString(example.expectedResult)
    var fn = 'function() {' + example.testCode + '}'
    return '__registerTest(\'' + id + '\', ' + fn + ');'
  }).join('')

  return '\n' + compiled
}

// Mocha `--require` support:
if (path.basename(process.argv[1]) === '_mocha') {
  var mocha = require('./mocha')
  // Avoid circular require weirdness
  if (module.parent.exports === mocha) {
    // We could just always delete the cache, but I think this is clearer and
    // shows explicitly what the circular problem is
    delete require.cache[path.join(__dirname, 'mocha.js')]
    mocha = require('./mocha')
  }

  mocha.toggleDoctestInjection()
}
