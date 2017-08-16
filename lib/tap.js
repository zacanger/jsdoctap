const { relative } = require('path')
const keep = require('zeelib/lib/keep').default
const map = require('zeelib/lib/map').default
const concat = require('zeelib/lib/concat').default
const filter = require('zeelib/lib/filter').default
const findWhere = require('zeelib/lib/find-where').default
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
  const functionComments = filter((c) =>
    c.ctx &&
    (c.ctx.type === 'method' ||
      c.ctx.type === 'function' ||
    (c.ctx.type === 'declaration' && c.ctx.value.includes('=>'))), parsedContent)

  const comments = map((comment) => {
    const exampleNodes = filter(({ type }) => type === 'example', comment.tags)
    const examples = concat(map((exampleNode) =>
      commentParser.run(exampleNode.string), exampleNodes))

    comment.examples = examples
    return examples.length ? comment : undefined
  }, functionComments)

  const ret = keep(comments)
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
  const moduleBlock = findWhere((block) =>
    block.tags && findWhere(({ type }) =>
      type === 'example', block.tags), parsedContent)

  if (moduleBlock) {
    const moduleTag = findWhere(({ type }) => type === 'module', moduleBlock.tags)
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

const getExampleCode = ({ testCase, expectedResult }) => {
  let ts = testCase.split('\n')
  const s = 'result = '
  ts[ts.length - 1] = s + ts[ts.length - 1]
  const joined = ts.join('\n')
  return { joined, expectedResult }
}

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
  let result
  tap.test('${mn}', (t) => {
    ${map((comment) => `${commentToTapSpec(comment)}`, keep(comments))}
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
  return map((example) =>
    `
    ${getExampleCode(example).joined}
    t.same(
      result,
      ${getExampleCode(example).expectedResult},
      '${escapeString(ctx.string)} ${escapeString(example.label || example.displayTestCase)}'
    )
    `, comment.examples)
}

module.exports = contentsToTapSpec
