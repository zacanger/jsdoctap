const { relative } = require('path')
const _ = require('lodash')
const { escapeString, stripExtension } = require('./util')
const commentParser = require('./comment-parser')
const dox = require('dox')

/**
 * Parses tests out of a file's contents and returns them. These are
 * `dox` outputted `comment` nodes, overloaded with an `examples` field which
 * adds `testCase` and `expectedResult` pairs to them.
 */

const getTests = (content) => {
  const parsedContent = dox.parseComments(content)
  const functionComments = _.filter(parsedContent, (c) =>
    c.ctx &&
    (c.ctx.type === 'method' ||
      c.ctx.type === 'function' ||
    (c.ctx.type === 'declaration' && c.ctx.value.includes('=>'))))

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

/**
 * Resolves the expected module name for a given file, to use as the top-level
 * spec when generating tap doctest `tap.test`
 *
 * @param {String} The root directory
 * @param {String} The module's filename
 * @return {String} moduleName
 */

const getModuleName = (rootDir, filename, parsedContent) => {
  const moduleBlock = _.find(parsedContent, (block) =>
    block.tags && _.find(block.tags, { type: 'module' }))

  if (moduleBlock) {
    const moduleTag = _.find(moduleBlock.tags, { type: 'module' })
    if (moduleTag && moduleTag.string) {
      const smoduleTag = moduleTag.string.split(' ')
      if (smoduleTag[0].charAt(0) === '{' && !!smoduleTag[1]) {
        return smoduleTag[1]
      } else if (smoduleTag[0]) {
        return smoduleTag[0]
      }
    }
  }

  const filenamePrime = relative(rootDir, filename)
  return stripExtension(filenamePrime)
}

/**
 * Compiles down an example.
 *
 * @param {Object} comment
 * @param {String} comment.testCase
 * @param {String} comment.expectedResult
 * @return {String}
 */

const getExampleCode = ({ testCase, expectedResult }) =>
  `${testCase},
      ${expectedResult}`

/**
 * Compiles a string containing the contents of a JSDoc annotated file and
 * outputs the generated tap spec.
 */

const contentsToTapSpec = (rootDir, filename, content) => {
  const comments = getTests(content)
  const moduleName = getModuleName(rootDir, filename, comments.source)

  const mn = escapeString(moduleName)
  return `
  const tap = require('tap')
  tap.test('${mn}', (t) => {
    ${_.map(_.compact(comments), (comment) => `${commentToTapSpec(comment)}`)}
    t.end()
  })
  `
}

/**
 * Compiles a jsdoc comment parsed by `dox` and its doctest examples into a
 * tap spec.
 */

const commentToTapSpec = (comment) => {
  const ctx = comment.ctx || {}
  return _.map(comment.examples, (example) =>
    `t.same(
      ${getExampleCode(example)},
      '${escapeString(ctx.string)} ${escapeString(example.label || example.displayTestCase)}'
    )
    `
  )
}

module.exports = contentsToTapSpec
