/**
 * Adds
 * @example
 * add(1)(1) // => 2
 */

const add = (a) =>
  (b) =>
    a + b

/**
 * Adds one
 * @example
 * addOne(1) // => 2
 */

const addOne = add(1)

/**
 * Returns two
 * @example
 * two() // => 2
 */

const two = () => addOne(1)
