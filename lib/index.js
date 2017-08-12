const fs = require('fs')
const path = require('path')
const dox = require('dox')
const _ = require('lodash')
const commentParser = require('./comment-parser')
const { escapeString, stripBOM } = require('./util')

/**
 * Parses tests out of a file's contents and returns them. These are
 * `dox` outputted `comment` nodes, overloaded with an `examples` field which
 * adds `testCase` and `expectedResult` pairs to them.
 */

const getTests = (content) => {
  const parsedContent = dox.parseComments(content)
  const functionComments = _.filter(parsedContent, (c) =>
    c.ctx && (c.ctx.type === 'method' || c.ctx.type === 'function'))

  const comments = _.map(functionComments, (comment) => {
    const exampleNodes = _.filter(comment.tags, { type: 'example' })
    const examples = _.flatten(_.map(exampleNodes, (exampleNode) =>
      commentParser.run(exampleNode.string)))

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

const registerTest = (id, fn) => {
  tests.push({ id, fn })
}

/**
 * Runs test cases accumulated in the `tests` array.
 */

const runRegistered = () => {
  let failed = false

  _.each(tests, (test) => {
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

const toJsdocRegister = (comment) => {
  const baseId = `${comment.ctx.name} -`
  const compiled = _.map(comment.examples, (example) => {
    const id = escapeString(baseId) +
             escapeString(example.testCase) + ' => ' +
             escapeString(example.expectedResult)
    const fn = 'function() {' + example.testCode + '}'
    return '__registerTest(\'' + id + '\', ' + fn + ');'
  }).join('')

  return '\n' + compiled
}

/**
 * Runs tests in some file, and reports the results to the command-line.
 */

const run = (filename) => {
  let content = fs.readFileSync(filename, 'utf8')
  const tests = getTests(content)

  content += _.map(tests, toJsdocRegister).join('')

  global.__registerTest = registerTest
  module._compile(stripBOM(content), filename)

  delete global.__registerTest
  return runRegistered()
}

module.exports = {
  getTests,
  registerTest,
  run,
  runRegistered,
  toJsdocRegister
}

if (path.basename(process.argv[1] === '_tap')) {
  let tap = require('./tap')
  if (module.parent.exports === tap) {
    delete require.cache[path.join(__dirname, 'tap.jsa')]
    tap = require('./tap')
  }

  tap.toggleInjection()
}
