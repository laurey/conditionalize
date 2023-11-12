<h1 align="center">
Conditionalize
</h1>

> A library of conditions builder and validator.

Conditionalize based on idea & codes from [sequelize Querying Where](https://sequelize.org/v5/manual/querying.html#where). And targets node.js and the browser.

## Browser Support

![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png) | ![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
--- | --- | --- | --- | --- | :---: |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | :x: |

## Installation

### Package manager

Using npm:

```bash
$ npm install conditionalize
```

Using yarn:

```bash
$ yarn add conditionalize
```

Using pnpm:

```bash
$ pnpm add conditionalize
```

You can import the library using `import` or `require` approach:

```js
// ES6
import Conditionalize from 'conditionalize';

const { Op } = Conditionalize;

const instance = new Conditionalize();
console.log(instance.check());
````

If you use `require`, **only default export is available**:

```js
// CommonJS
const Conditionalize = require('conditionalize');

const instance = new Conditionalize();
console.log(instance.check());
```

## Examples
### Basic
```js
import Conditionalize from 'conditionalize';

const instance = new Conditionalize();

instance.check();
// => true
```

### Constructor With options

Name | Type | Default | Description
-|-|-|-
dataSource | object | - | Input data that needs to check
where | object | - | Logical comparisons(and/or/not .etc)
operatorsMap | object | - | The map of operators
operatorsAliases | object | - | The alias of operators

```js
import Conditionalize from 'conditionalize';

const { Op } = Conditionalize;

const instance = new Conditionalize({
  dataSource: {
    authorId: 20,
    rank: 2
  },
  where: {
    authorId: {
      [Op.gte]: 22
    }
  }
});

instance.check();
// => false
```

## API
@TODO

## Tests
Tests are using jest, to run the tests use:
```sh
$ npm run test
```

## Coverage
Jest output coverage files to `coverage` directory.
```sh
$ npm run coverage
```

## License
This software is released under the terms of the [MIT license](./LICENSE).
