import { strict as assert } from "node:assert"
import { describe, it } from "node:test"
import handlebarsPackage from "handlebars"
import { createJsonHandlebars } from "../../dist/templating/createJsonHandlebars.js"
import fs from "node:fs"

const createDefaultHandlebars = handlebarsPackage.create

describe("templating/createJsonHandlebars.spec.mjs", () => {
  describe("create", () => {
    it("Parse simple JSON template", () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = JSON.stringify({ message: "Hello {{name}}!" })
      const data = { name: "World" }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data)

      // assert
       assert.notEqual(actual, null)
       assert.equal(actual.message, "Hello World!")
    })

    it("Parse simple JSON template with quotes", () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = `{ "message": "Hello {{name}}!" }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data)

      // assert
      assert.notEqual(actual, null)
      assert.equal(actual.message, 'Hello Quinton "Rampage" Jacksons!')
    })

    it("Parse with create", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": "Hello {{name}}!" }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data)

      // assert
      assert.notEqual(actual, null)
      assert.equal(actual.message, 'Hello Quinton "Rampage" Jacksons!')
    })

    it("Default handlebars should not be affected.", () => {
      // arrange
      const json = createJsonHandlebars()
      const standard = createDefaultHandlebars()
      const template = `{ "message": "Hello {{name}}!" }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      // act
      const compiledTemplate = standard.compile(template)
      const actual = compiledTemplate(data)

      // assert
      assert.equal(actual,
        `{ "message": "Hello Quinton &quot;Rampage&quot; Jacksons!" }`
      )
    })

    it("Parse with quoted partial", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": {{>partial}} }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      handlebars.registerPartial("partial", '"{{name}}"')

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data)

      // assert
      assert.notEqual(actual, null)
      assert.deepEqual(actual.message, 'Quinton "Rampage" Jacksons')
    })

    it("Parse with array-like partial, without array being part of the partial", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": [{{>partial}}] }`

      handlebars.registerPartial("partial", '{ "name": "one" }, { "name": "two" } ')

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate()

      // assert
      assert.notEqual(actual, null)
      assert.notEqual(actual.message, null)
      assert.ok(Array.isArray(actual.message))
      assert.deepEqual(actual.message[0].name, "one")
      assert.deepEqual(actual.message[1].name, "two")
    })

    it("Parse with array-like partial, without end array being part of the partial", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": [ {{>partial}} }`

      handlebars.registerPartial("partial", '{ "name": "one" }, { "name": "two" } ]')

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate()

      // assert
      assert.notEqual(actual, null)
      assert.notEqual(actual.message, null)
      assert.ok(Array.isArray(actual.message))
      assert.deepEqual(actual.message[0].name, "one")
      assert.deepEqual(actual.message[1].name, "two")
    })
  })

  describe("error handling", () => {
    it("forget a comma in an array", () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = `{
            "blocks": [
                {{#items}}
                { "message": "Hello {{name}}!" }
                {{/items}}
            ]
        }`
      const data = { items: [{ name: "Alpha" }, { name: "Beta" }] }

      // act
      const compiledTemplate = handlebars.compile(template)
      assert.throws(() => compiledTemplate(data), (ex) => {
        assert.equal(ex.toString(), `SyntaxError: Expected ',' or ']' after array element in JSON at position 88 (line 4 column 17)
1: {
2:             "blocks": [
3:                 { "message": "Hello Alpha!" }
4:                 { "message": "Hello Beta!" }
-------------------^
5:             ]
6:         }`)
        return true
      })
    })

    it("correct for enters", () => {
      const handlebars = createJsonHandlebars()
      const template = `{
            "a": "b"

            "c": "d"
}`

      // act
      const compiledTemplate = handlebars.compile(template)
      assert.throws(() => compiledTemplate({}), (ex) => {
        assert.equal(ex.toString(), `SyntaxError: Expected ',' or '}' after property value in JSON at position 35 (line 3 column 13)
1: {
2:             "a": "b"
3:             "c": "d"
---------------^
4: }`)
        return true
      })
    })
  })

  describe("error handling with line numbers beyond 10", async () => {
    it("wrong double d", async () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = await fs.promises.readFile(import.meta.dirname + "/../files/templates/broken-home.handlebars")

      // act
      const compiledTemplate = handlebars.compile(template.toString())
      assert.throws(() => compiledTemplate(), (ex) => {
        assert.equal(ex.toString(), `SyntaxError: Expected ',' or '}' after property value in JSON at position 434 (line 21 column 8)
17:             "type": "plain_text",
18:             "text": ":Provision Database"
19:           }
20:         }
21:       ]dd
-----------^
22:     }
23:   ]
24: }`)
        return true
      })
    })
  })

  describe("parsing of enters", () => {
    it("replace enters", () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = `{
  "a": "{{name}}"

  ,

  "b": "{{name}}"
}`
      const data = { name: "World" }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data)

      // assert
      assert.notEqual(actual, null)
      assert.equal(actual.a, data.name)
      assert.equal(actual.b, data.name)
    })
  })
})
