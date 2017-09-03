# jsdoctap

Test runner for doctests using JSDoc examples and node-tap.

Based on the hard work of [@yamadapc](https://github.com/yamadapc) and [this
project](https://github.com/yamadapc/jsdoctest).

* [Examples](./examples)
* [Roadmap and known bugs](#roadmap)
* [Changes](./CHANGELOG.md)

![screenshot](http://zacanger.com/jsdoctap.gif)

--------

## Installation

`npm i -D jsdoctap`

## Usage

`jsdoctap some-file.js`

I recommend adding it to your npm scripts. Example:

```json
{
  "scripts": {
    "test": "jsdoctap src/*.js"
  }
}
```

### Format

Tests must be under an `@example` in a valid JSDoc comment.
The return value to be tested against must come after a line comment with an
arrow (Clojure REPL style):

```javascript
/**
 * Identity
 * @example
 * id(1) // => 1
 */
```

Line breaks between the call and the comment are fine:

```javascript
/**
 * Identity
 * @example
 *   id(1)
 *   // => 1
 */

```

Line breaks in function calls currently do _not_ work:

```javascript
/**
 * This will break!
 * @example
 * id(
 *   1
 * ) // => 1
```

Source and examples that need to be Babelified work just fine, as long as you
have Babel configured and modules installed.


### API

I strongly recommend just using this as a command-line test runner. However, it
does have a basic Node API. Example:

```javascript
const t = require('jsdoctap')
const { readdirSync } = require('fs')
const files = readdirSync('./src')
files.forEach((f) => { t('./src' + f) })
```

## Roadmap

* Multi-line function calls don't work
* Currently does not work with dependencies that are ES modules
* Currently does not work with local modules (only in `node_modules`)
* Babel configs in package.json don't work
* Clean up comment-parser and getModuleName (in tap)
* Quickcheck-like features?
* Type it (Flow, probably)
* More tests and examples

## License

[MIT](./LICENSE.md)
