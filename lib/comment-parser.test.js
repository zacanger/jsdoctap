const tap = require('tap')
const commentParser = require('./comment-parser')

tap.test('jsdoctest/comment-parser', (t) => {
  t.same(
    commentParser.parseComments(
      'function something() {' +
      '/* multi-line comment here\n' +
      '                          */\n' +
      '}\n' +
      '\n' +
      'something() // single-line comment here'
    ),
    [
      { type: 'code', string: 'function something() {' },
      { type: 'comment', string: 'multi-line comment here' },
      { type: 'code', string: '}\n\nsomething()' },
      { type: 'comment', string: 'single-line comment here' }
    ], '.parseComments(input) differentiates code blocks from comments'
  )

  t.same(
    commentParser.parseExamples(commentParser.parseComments(
      'a()\n' +
      '// ignored\n' +
      'b()\n' +
      '// => 20'
    )),
    [ { displayTestCase: 'b()', testCase: 'b()', expectedResult: '20' } ],
    '.parseComments(parseComments) extracts examples out of parsed comments'
  )

  /*
  t.same(
    commentParser.parseExamples(commentParser.parseComments(
      `
      const plusTen = (a) => a + 10
      const arr = [ 1, 2, 3 ]
      map(arr, plusTen)
      // => [ 11, 12, 13 ]
      `
    )),
    [ {
      displayTestCase: 'const plusTen = (a) => a + 10; const arr = [ 1, 2, 3 ]; map(arr, plusTen)',
      testCase: `const plusTen = (a) => a + 10
      const arr = [ 1, 2, 3 ]
      map(arr, plusTen)
      `,
      expectedResult: '[ 11, 12, 13 ]'
    } ],
    '.parseComments(parseComments) handles helpers'
  )
  */

  /*
  t.same(
    commentParser.parseExamples(commentParser.parseComments(
      'map([1, 2, 3], function(x) {\n' +
      '  return x + 10\n' +
      '});\n' +
      '// => [11, 12, 13]'
    )),
    [ {
      displayTestCase: 'map([1, 2, 3], function(x) {;  return x + 10;})',
      testCase: 'map([1, 2, 3], function(x) {\n  return x + 10\n})',
      expectedResult: '[11, 12, 13]'
    } ],
    '.parseComments(parseComments) handles multiple line examples'
  )
  */

  t.end()
})
