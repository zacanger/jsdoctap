// this is extracted from a helper in jest's src
// it can definitely be simplified

const BABELRC_FILENAME = '.babelrc'
const BABELRC_JS_FILENAME = '.babelrc.js'
const BABEL_CONFIG_KEY = 'babel'
const PACKAGE_JSON = 'package.json'
const fs = require('fs')
const path = require('path')
const cache = Object.create(null)

const getBabelRC = (filename) => {
  const paths = []
  let directory = filename
  while (directory !== (directory = path.dirname(directory))) {
    if (cache[directory]) {
      break
    }

    paths.push(directory)
    const configFilePath = path.join(directory, BABELRC_FILENAME)
    if (fs.existsSync(configFilePath)) {
      cache[directory] = configFilePath
      break
    }

    const configJsFilePath = path.join(directory, BABELRC_JS_FILENAME)
    if (fs.existsSync(configJsFilePath)) {
      cache[directory] = configJsFilePath
      break
    }

    const resolvedJsonFilePath = path.join(directory, PACKAGE_JSON)
    const packageJsonFilePath =
      resolvedJsonFilePath === PACKAGE_JSON
        ? path.resolve(directory, PACKAGE_JSON)
        : resolvedJsonFilePath

    if (fs.existsSync(packageJsonFilePath)) {
      const packageJsonFileContents = packageJsonFilePath
      if (packageJsonFileContents[BABEL_CONFIG_KEY]) {
        cache[directory] = JSON.stringify(packageJsonFileContents[BABEL_CONFIG_KEY])
        break
      }
    }
  }

  paths.forEach((directoryPath) => (cache[directoryPath] = cache[directory]))
  return cache[directory] || ''
}

module.exports = getBabelRC
