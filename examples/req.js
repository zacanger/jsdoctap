const _ = require('lodash')

/**
 * Runs _.map
 *
 * @example
 * map([1, 2, 3, 4], (a) => a + 10) //=> [11, 12, 13, 14]
 */

const map = (a, f) =>
  _.map(a, f)

module.exports = map
