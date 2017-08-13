const fs = require('fs')
const dox = require('dox')
const _ = require('lodash')
const commentParser = require('./comment-parser')
const { stripBOM } = require('./util')
const t = require('./tap')

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

const run = (filename) => {
  let content = fs.readFileSync(filename, 'utf8')
  const testPlusCode = content + t.contentsToTapSpec(process.cwd(), filename, content)
  module._compile(stripBOM(testPlusCode), filename)
}

module.exports = {
  getTests,
  run
}
