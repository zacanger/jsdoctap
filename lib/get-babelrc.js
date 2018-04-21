// this is extracted from a helper in jest's src
// it can definitely be simplified

const BABELRC_FILENAME = '.babelrc'
const BABELRC_JS_FILENAME = '.babelrc.js'
const PACKAGE_JSON = 'package.json'
const fs = require('fs')
const path = require('path')
const cache = Object.create(null)

const getBabelRC = (filename) => {
  const paths = []
  let isPackage = false
  let directory = filename
  // eslint-disable-next-line
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
      const pj = require(packageJsonFilePath)
      if (pj.babel) {
        const t = directory + '/.babelrc'
        fs.writeFileSync(t, JSON.stringify(pj.babel, null, 2))
        cache[directory] = t
        isPackage = true
        break
      }
    }
  }

  paths.forEach((directoryPath) => (cache[directoryPath] = cache[directory]))
  const babelRc = cache[directory] || ''
  return { babelRc, isPackage }
}

module.exports = getBabelRC
