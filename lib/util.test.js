const tap = require('tap')
const { trimString, escapeString, stripExtension } = require('./util')

tap.test('util', (t) => {
  // eslint-disable-next-line no-useless-escape
  t.same(escapeString('foo \ \ bar'), 'foo   bar', 'escapeString works')
  t.same(trimString('\n    \tfoo bar\n\t  '), 'foo bar', 'trimString works')
  t.same(stripExtension('foo.js'), 'foo', 'stripExtension works')
  t.end()
})
