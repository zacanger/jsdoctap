const { trimString } = require('./util')
const collapseWhitespace = require('zeelib/lib/collapse-whitespace')

/**
 * Parses comments and code from a string. Heavily inspired by the code in @tj's
 * `dox` module
 *
 * @param {String} input
 * @return {Array} parsed
 */

const parseComments = (input) => {
  input = input.replace(/\r\n/gm, '\n')
  let nodes = []

  let insideSinglelineComment = false
  let insideMultilineComment = false

  let currentNode = { type: 'code', string: '' }

  const flush = () => {
    currentNode.string = trimString(currentNode.string)
    nodes.push(currentNode)
    currentNode = { type: 'code', string: '' }
  }

  for (let i = 0, len = input.length; i < len; i += 1) {
    if (insideMultilineComment) {
      if (input[i] === '*' && input[i + 1] === '/') {
        flush()
        insideMultilineComment = false
        i += 1
        continue
      }
    } else if (insideSinglelineComment) {
      if (input[i] === '\n') {
        flush()
        insideSinglelineComment = false
        continue
      }
    } else if (input[i] === '/') {
      if (input[i + 1] === '*') {
        flush()
        currentNode.type = 'comment'
        insideMultilineComment = true
        i += 1
        continue
      } else if (input[i + 1] === '/') {
        flush()
        currentNode.type = 'comment'
        insideSinglelineComment = true
        i += 1
        continue
      }
    }

    currentNode.string += input[i]
  }

  flush()
  return nodes
}

/**
 * Parses jsdoc examples for our doctests out of the parsed comments.
 *
 * @param {Array} parsedComments Parsed output from `parseComments`
 * @return {Array} parsedExamples
 */

const parseExamples = (parsedComments) => {
  let examples = []
  let currentExample = { expectedResult: '' }
  let caption
  let currentCaption

  const flush = () => {
    if (currentExample.expectedResult) {
      examples.push(currentExample)
    }
    currentExample = { expectedResult: '' }
  }

  for (let i = 0, len = parsedComments.length; i < len; i++) {
    if (parsedComments[i].type === 'code') {
      if (currentExample.testCase) flush()

      currentExample.testCase = parsedComments[i].string
        // .replace(/\n/g, ';')
        .replace(/^<caption>.+<\/caption>\s*/, '')
        .replace(/;$/, '')

      currentExample.displayTestCase = parsedComments[i].string
        .replace(/\n/g, ';')
        .replace(/^<caption>.+<\/caption>\s*/, '')
        .replace(/;$/, '')
      currentExample.displayTestCase = collapseWhitespace(currentExample.displayTestCase)

      currentCaption = parsedComments[i].string
        .match(/^<caption>(.+)<\/caption>/)

      if (currentCaption && currentCaption[1]) {
        caption = currentCaption[1]
      }

      if (caption) {
        currentExample.label = currentExample.testCase + ' - ' + caption
      }
    } else if (parsedComments[i].type === 'comment' && currentExample.testCase) {
      if (parsedComments[i].string.indexOf('=>') === 0) {
        currentExample.expectedResult += parsedComments[i].string.slice(3)
      }
    }
  }

  flush()
  return examples
}

/**
 * Parses doctest examples from a string.
 *
 * @param {String} input
 * @return {Array} examples
 */

const run = (input) =>
  parseExamples(parseComments(input))

module.exports = {
  run,
  parseExamples,
  parseComments
}
