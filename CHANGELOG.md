* `0.5.7` - 2018-08-03
  * Fix test cases that use double slashes in URLs. Thanks [@adw0rd](https://github.com/adw0rd)!
* `0.3.0` - 2017-08-19
  * Add Babel support. `jsdoctap` will now use your local Babel config and
    modules. I really hope this didn't break something else.
* `0.2.0` - 2017-08-15
  * Fix helpers/other declarations/whatever in examples. **Important** this
    partially kinda breaks one possible formatting. No single expression in an
    `@example` can span multiple lines (which was broken before, and then fixed
    for a minute, but is now broken again). So:
    ```javascript
    /**
     * THIS WORKS
     * @example
     * const arr = [ 1, 2, 3 ]
     * const plusTen = (a) => a + 10
     * map(plusTen, arr)
     *   // => [ 11, 12, 13 ]
     */

    /**
     * BUT THIS DOES NOT
     * @example
     * const arr = [ 1, 2, 3 ]
     * const plusTen = (a) =>
     *   a + 10
     * map(
     *   plusTen,
     *   arr
     * ) // => [ 11, 12, 13 ]
     */
    ```
* `0.1.5` - 2017-08-13
  * Now with less noisy output, colors in the help, and a demo gif!
* `0.1.0` - 2017-08-13
  * First real release. It works!
