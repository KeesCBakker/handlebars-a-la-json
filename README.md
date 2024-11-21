# Handlebars a la JSON
Handlebars is a great and simple templating engine for generating HTML. But what if you need to generate JSON? That's what this package does.

## Installation
Install it using NPM:
```sh
npm install --save handlebars-a-la-json
```

## Usage
You basically instantiate the handler and use it. Instead of a string it will return a JSON object.
```js
const { createJsonHandlebars } = "handlebars-a-la-json";

// instantiate JSON version
const handlebars = createJsonHandlebars();

// compile the template
const template = `{ "message": "Hello {{name}}!" }`;
const compiledTemplate = handlebars.compile(template);

// execute the template
const data = { name: 'Quinton "Rampage" Jacksons' };
const obj = compiledTemplate(data);

// obj.message == 'Hello Quinton "Rampage" Jacksons!'
```

## Error handling
It is really easy to create invalid JSON when you are templating. To make things easier, we've included better error messages. The following code will generate invalid JSON:
```js
const handlebars = createJsonHandlebars();
const template = `{
  "blocks": [
    {{#items}}
    { "message": "Hello {{name}}!" }
    {{/items}}
]}`;
const data = { items: [{ name: "Alpha" }, { name: "Beta" }] };
const compiledTemplate = handlebars.compile(template);
compiledTemplate(data);
```
The error message will be:
```txt
SyntaxError: Unexpected token { in JSON at position 88
3:    { "message": "Hello Alpha!" }
4:    { "message": "Hello Beta!" }
-----^
5:  ]
```
This will help you debug and find out that you're missing a comma between the objects.

## Notes
Because of the nature of this implementation you will have to add any helpers to the created object. Doing this will ensure that HTML- and JSON-template won't collide. Because this package will uncache the current Handlebars-package, it needs to be referenced before or after Handlebar setup.

It is better to use the `Handlebars.create` to rule out any collisions. More info here: http://handlebarsjs.com/reference.html#base-create


## Template parsing made easier
To make template parsing easier, we've added a `NamedTemplateParser`, that can be used to load and compile templates from a directory:

```js
const { createJsonHandlebars, NamedTemplateParser } = "handlebars-a-la-json";

const handlebars = createJsonHandlebars()
const parser = new NamedTemplateParser(handlebars)

// load dir
await parser.loadTemplatesFromDirectory("./test/files/templates/")

// custom
parser.addNamedTemplate("main", '{ "count": {{items.length}}, "list": [{{#items}}{{> include}}{{#unless @last}}, {{/unless}}{{/items}}] }')
parser.addNamedTemplate("include", '"-{{name}}"')

const actual = parser.parse("main", { items: [{ name: "Alpha" }, { name: "Beta" }] })
```

