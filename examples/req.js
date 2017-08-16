const m = require('zeelib/lib/map').default

/**
 * Runs zeelib.map
 *
 * @example
 * map([1, 2, 3, 4], (a) => a + 10) //=> [11, 12, 13, 14]
 * map([1, 2, 3, 4], (a) => a + 20) // => [21, 22, 23, 24]
 */

const map = (a, f) =>
  m(f, a)

module.exports = map
