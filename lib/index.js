const { readFileSync } = require('fs')
const { stripBOM } = require('./util')
const toSpec = require('./tap')
const babel = require('babel-core')
const getRc = require('./get-babelrc')
const req = require('require-from-string')

const runTests = (filename) => {
  const content = readFileSync(filename, 'utf8')
  const spec = toSpec(process.cwd(), filename, content)
  const testPlusCode = content + spec
  const babelRc = getRc(filename)
  const opts = { extends: babelRc }
  const transformed = babel.transform(testPlusCode, opts).code

  req(stripBOM(transformed), filename)
}

module.exports = runTests
