* Babel support
* Globbing might be messed up? May need to handle manually
* Formatting of multi-line examples in output is totally wrong
* Fix blocks that use helper functions. Failing example:
    ```javascript
    const id = (a) => a
    map(id, [ 1, 2, 3, 4 ]) // => [ 1, 2, 3, 4 ]
    ```
* Remove Lodash (already using zeelib for colors, so might as well use it for
  the rest)
* Clean up comment-parser and getModuleName (in tap)
* Quickcheck-like features?
* Type it (Flow, probably)
* More tests and examples
