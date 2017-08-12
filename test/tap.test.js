const path = require('path')
const tap = require('../lib/tap')

tap.test('.loadDoctests(module, filename)', (t) => {
  it('loads jsdoctests from a file and append them as tap specs', () => {
    const mockModule = {
      _compile: onCompile
    }

    tap.loadDoctests(mockModule, path.join(__dirname, 'test-file.js'))

    function onCompile (content, filename) {
      content.should.containEql(
      '\ndescribe(\'add()\', function() {' +
          'it(\'add(1, 2)\', function() {' +
            '(add(1, 2)).should.eql(3);' +
          '});' +
        '});'
      )
      filename.should.equal(path.join(__dirname, 'test-file.js'))
    }
  })

  it('handles <caption>s in @example tags', () => {
    const mockModule = {
      _compile: onCompile
    }

    tap.loadDoctests(mockModule, path.join(__dirname, 'test-file-captioned.js'))

    function onCompile (content, filename) {
      content.should.containEql(
      '\ndescribe(\'add()\', function() {' +
          'it(\'add(1, 2) - Integers\', function() {' +
            '(add(1, 2)).should.eql(3);' +
          '});\n' +
          'it(\'add(3, 2) - Integers\', function() {' +
            '(add(3, 2)).should.eql(5);' +
          '});\n' +
          'it(\'add(1.5, 2.5) - Doubles\', function() {' +
            '(add(1.5, 2.5)).should.eql(4);' +
          '});' +
        '});'
      )
      filename.should.equal(path.join(__dirname, 'test-file-captioned.js'))
    }

  })

  t.end()
})
