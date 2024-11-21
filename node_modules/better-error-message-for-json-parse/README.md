# Safe JSON Parse

The main goal of this project is to provide a nice error message for the `SyntaxError` that may occur while parsing JSON data.

For example, parsing the following JSON:

```
{
  "index": 1,
  "index_start_at": 56,
  "integer": 6,
  "float": 11.6816,
  "name": "Eva",
  "surname" "Rowland",
  "fullname": "Denise Pickett",
  "email": "jack@garrison.vc",
  "bool": false
}
```

will result in the following error message:

```
Unexpected string in JSON at position 105
  "name": "Eva",
  "surname" "Rowland",
-----------^
  "fullname": "Denise Pickett"
```

### How to use

1. import it
```js
var { safeJsonParse } = require('better-error-message-for-json-parse');
```

2. use it
```js
try {
  safeJsonParse('{"a": 2, "b": 3, "v" 3, "e": 4 }');
} catch (e) {
  console.log(e);
}
```

3. enjoy:
```
$ node index.js
SyntaxError: Unexpected number in JSON at position 21
{"a": 2, "b": 3, "v" 3, "e": 4 }
--------------------^
at exports.safeJsonParse
```
