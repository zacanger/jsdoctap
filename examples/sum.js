// @flow

/**
 * Sum an array of numbers
 * @example
 * sum([ 1, 2, 3, 4 ]) // => 10
 */

const sum = (nums: number[]): number =>
  nums.reduce((acc, cur) => acc + cur, 0)

export default sum
