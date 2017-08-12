/* eslint-disable node/no-deprecated-api */
const { readFileSync } = require('fs')
const { relative } = require('path')
const _ = require('lodash')
const { getTests } = require('.')
const { escapeString, stripExtension, stripBOM } = require('./util')

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
  `${testCase}, ${expectedResult}`

/**
 * Compiles a string containing the contents of a JSDoc annotated file and
 * outputs the generated tap spec for its JSDocTests.
 */

const contentsToTapSpec = (rootDir, filename, content) => {
  const comments = getTests(content)
  const moduleName = _getModuleName(rootDir, filename, comments.source)

  return `
  tap.test(${escapeString(moduleName)}, (t) => {
    ${_.map(_.compact(comments), (comment) =>
      commentToTapSpec(comment)
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
  return `t.same(
    ${_.map(comment.examples, (example) =>
      getExampleCode(example)
    )},
    ${escapeString(ctx.string)} ${escapeString(example.label || example.displayTestCase)}
  )`
}

let originalLoad

/**
 * Toggles doctest injection into loaded modules. That is: doctests will be
 * compiled into modules as mocha specs, whenever they're declared.
 */

const toggleInjection = () => {
  if (originalLoad) {
    require.extensions['.js'] = originalLoad
  } else {
    originalLoad = originalLoad || require.extensions['.js']
    require.extensions['.js'] = (module, filename) => {
      if (filename.match(/node_modules/)) {
        return originalLoad(module, filename)
      }
      return exports.loadDoctests(module, filename)
    }
  }
}

module.exports = {
  _getModuleName,
  commentToTapSpec,
  contentsToTapSpec,
  loadDoctests,
  toggleInjection
}
