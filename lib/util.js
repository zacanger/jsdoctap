/* eslint-disable no-useless-escape */

/**
 * Remove trailing and leading whitespace
 * @example
 * trimString('\n    \tfoo bar\n\t  ') // => 'foo bar'
 */
const trimString = (str) =>
  str.replace(/(^\s*)|(\s*$)/g, '')

// Copied from node.js' built-in `lib/module.js` module
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }
  return content
}

/**
 * Escapes string for meta-quoting
 * @example
 * escapeString('foo \ \ bar') // => 'foo   bar'
 * escapeString('foo \' \ bar') // =>, 'foo \\\'  bar'
 */

const escapeString = (str) =>
  str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')

/**
 * Strips extension(s)
 * @example
 * stripExtension('foo.js') // => 'foo'
 */

const stripExtension = (f) =>
  f.replace(/\..+$/, '')

module.exports = {
  trimString,
  stripBOM,
  escapeString,
  stripExtension
}
