const { readFileSync } = require('fs')
const { stripBOM } = require('./util')
const toSpec = require('./tap')

const runTests = (filename) => {
  const content = readFileSync(filename, 'utf8')
  const spec = toSpec(process.cwd(), filename, content)
  const testPlusCode = content + spec

  module._compile(stripBOM(testPlusCode), filename)
}

module.exports = runTests
