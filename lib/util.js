// Remove trailing and leading whitespace
const trimString = (str) =>
  str.replace(/(^\s*)|(\s*$)/g, '')

// Copied from node.js' built-in `lib/module.js` module
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1)
  }
  return content
}

// Escapes a string for meta-quoting
const escapeString = (str) =>
  str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')

const stripExtension = (f) =>
  f.replace(/\..+$/, '')

module.exports = {
  trimString,
  stripBOM,
  escapeString,
  stripExtension
}
