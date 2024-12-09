import { expect } from "chai"
import { create as createDefaultHandlebars } from "handlebars"
import { createJsonHandlebars } from "../../src/templating/createJsonHandlebars"
import fs from "fs"

describe("templating/createJsonHandlebars.spec.ts", () => {
  describe("create", () => {
    it("Parse simple JSON template", () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = JSON.stringify({ message: "Hello {{name}}!" })
      const data = { name: "World" }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data) as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.message).to.equal("Hello World!")
    })

    it("Parse simple JSON template with quotes", () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = `{ "message": "Hello {{name}}!" }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data) as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.message).to.equal('Hello Quinton "Rampage" Jacksons!')
    })

    it("Parse with create", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": "Hello {{name}}!" }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate(data) as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.message).to.equal('Hello Quinton "Rampage" Jacksons!')
    })

    it("Default handlebars should not be affected.", () => {
      // arrange
      const json = createJsonHandlebars()
      const standard = createDefaultHandlebars()
      const template = `{ "message": "Hello {{name}}!" }`
      const data = { name: 'Quinton "Rampage" Jacksons' }

      // act
      const compiledTemplate = standard.compile(template)
      const actual = compiledTemplate(data) as any

      // assert
      expect(actual, "Actual should be an object that has HTML escaped strings.").to.equal(
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
      const actual = compiledTemplate(data) as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.message).to.eql('Quinton "Rampage" Jacksons' )
    })

    it("Parse with array-like partial, without array being part of the partial", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": [{{>partial}}] }`

      handlebars.registerPartial("partial", '{ "name": "one" }, { "name": "two" } ')

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate() as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.message).not.to.be.null;
      expect(actual.message).to.be.an('array');
      expect(actual.message[0].name).to.eql('one');
      expect(actual.message[1].name).to.eql('two');
    })

    it("Parse with array-like partial, without end array being part of the partial", () => {
      // arrange
      const handlebars = createJsonHandlebars().create()
      const template = `{ "message": [ {{>partial}} }`

      handlebars.registerPartial("partial", '{ "name": "one" }, { "name": "two" } ]')

      // act
      const compiledTemplate = handlebars.compile(template)
      const actual = compiledTemplate() as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.message).not.to.be.null;
      expect(actual.message).to.be.an('array');
      expect(actual.message[0].name).to.eql('one');
      expect(actual.message[1].name).to.eql('two');
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
      try {
        compiledTemplate(data)
      } catch (ex) {
        expect(ex.toString()).to.equal(`SyntaxError: Expected ',' or ']' after array element in JSON at position 88
1: {
2:             "blocks": [
3:                 { "message": "Hello Alpha!" }
4:                 { "message": "Hello Beta!" }
-------------------^
5:             ]
6:         }`)
      }
    })

    it("correct for enters", () => {
      const handlebars = createJsonHandlebars()
      const template = `{
            "a": "b"

            "c": "d"
}`

      // act
      const compiledTemplate = handlebars.compile(template)
      try {
        compiledTemplate({})
      } catch (ex) {
        expect(ex.toString()).to.equal(`SyntaxError: Expected ',' or '}' after property value in JSON at position 35
1: {
2:             "a": "b"
3:             "c": "d"
---------------^
4: }`)
      }
    })
  })

  describe("error handling with line numbers beyond 10", async () => {
    it("wrong double d", async () => {
      // arrange
      const handlebars = createJsonHandlebars()
      const template = await fs.promises.readFile(__dirname + "/../files/templates/broken-home.handlebars")

      // act
      const compiledTemplate = handlebars.compile(template.toString())
      try {
        compiledTemplate()
      } catch (ex) {
        expect(ex.toString()).to.equal(`SyntaxError: Expected ',' or '}' after property value in JSON at position 434
17:             "type": "plain_text",
18:             "text": ":Provision Database"
19:           }
20:         }
21:       ]dd
-----------^
22:     }
23:   ]
24: }`)
      }
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
      const actual = compiledTemplate(data) as any

      // assert
      expect(actual).not.to.be.null
      expect(actual.a).to.equal(data.name)
      expect(actual.b).to.equal(data.name)
    })
  })
})
