const { readFileSync, existsSync, unlinkSync } = require('fs')
const removeBOM = require('zeelib/lib/remove-bom')
const toSpec = require('./tap')
const babel = require('babel-core')
const getRc = require('./get-babelrc')
const req = require('require-from-string')

const runTests = (filename) => {
  const content = readFileSync(filename, 'utf8')
  const spec = toSpec(process.cwd(), filename, content)
  const testPlusCode = content + spec
  const { babelRc, isPackage } = getRc(filename)
  const opts = { extends: babelRc }
  const transformed = babel.transform(testPlusCode, opts).code

  req(removeBOM(transformed), filename)

  process.on('exit', () => {
    if (isPackage && existsSync(babelRc)) {
      unlinkSync(babelRc)
    }
  })
}

module.exports = runTests
