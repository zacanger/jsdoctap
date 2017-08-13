/* eslint-disable no-useless-escape */

const tap = require('tap')
const { trimString, escapeString, stripExtension } = require('./util')

tap.test('util', (t) => {
  t.same(escapeString('foo \ \ bar'), 'foo   bar', 'escapeString works with no quotes')
  t.same(escapeString('foo \' \ bar'), 'foo \\\'  bar', 'escapeString works with quotes')
  t.same(trimString('\n    \tfoo bar\n\t  '), 'foo bar', 'trimString works')
  t.same(stripExtension('foo.js'), 'foo', 'stripExtension works')
  t.end()
})
