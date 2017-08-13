/* eslint-disable node/no-deprecated-api */
const { readFileSync } = require('fs')
const { relative } = require('path')
const _ = require('lodash')
const { getTests } = require('.')
const { escapeString, stripExtension, stripBOM } = require('./util')
const TAP = require('tap')

/**
 * Resolves the expected module name for a given file, to use as the top-level
 * spec when generating tap doctest `tap.test`
 *
 * @param {String} The root directory
 * @param {String} The module's filename
 * @return {String} moduleName
 */

const _getModuleName = (rootDir, filename, parsedContent) => {
  const moduleBlock = _.find(parsedContent, (block) =>
    block.tags && _.find(block.tags, { type: 'module' })
  )
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
 * Compiles down an `example`.
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
 * outputs the generated tap spec for its JSDocTests.
 */

const contentsToTapSpec = (rootDir, filename, content) => {
  const comments = require('.').getTests(content)
  const moduleName = _getModuleName(rootDir, filename, comments.source)

  const mn = escapeString(moduleName)
  return `
  const tap = require('tap')
  tap.test('${mn}', (t) => {
    ${_.map(_.compact(comments), (comment) => {
      return `${commentToTapSpec(comment)}`
    }
    )}
    t.end()
  })
  `
}

/**
 * Mocks `mocha`'s register environment for doctest mocha integration. This
 * works in the same manner `coffee-script/register` or `mocha --require
 * foo` work.
 */

const loadDoctests = (module, filename) => {
  const rootDir = process.cwd()
  const content = readFileSync(filename, 'utf8')
  const tapSpec = contentsToTapSpec(rootDir, filename, content)
  module._compile(stripBOM(content + tapSpec), filename)
}

/**
 * Compiles a jsdoc comment parsed by `dox` and its doctest examples into a
 * tap spec.
 */

const commentToTapSpec = (comment) => {
  const ctx = comment.ctx || {}
  const toRet = _.map(comment.examples, (example) =>
    `t.same(
      ${getExampleCode(example)},
      '${escapeString(ctx.string)} ${escapeString(example.label || example.displayTestCase)}'
    )
  `
  )
  return toRet
}

module.exports = {
  _getModuleName,
  commentToTapSpec,
  contentsToTapSpec,
  loadDoctests
}
