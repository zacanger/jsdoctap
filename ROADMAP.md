* Babel support
* Fix blocks that use helper functions. Failing example:
    ```javascript
    const id = (a) => a
    map(id, [ 1, 2, 3, 4 ]) // => [ 1, 2, 3, 4 ]
    ```
* Remove lodash?
* Quickcheck-like features?
* Type it (Flow, probably)
* More tests and examples
