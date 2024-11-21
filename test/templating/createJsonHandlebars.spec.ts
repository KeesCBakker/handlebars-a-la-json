import { expect } from "chai"
import { create as createDefaultHandlebars } from "handlebars"
import { createJsonHandlebars } from "../../src/templating/createJsonHandlebars"

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
  })

  describe("error handling", () => {
    it("forget a comma in an arry", () => {
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
------------------^
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
--------------^
4: }`)
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
  function escapeJson(txt: string) {
    throw new Error("Function not implemented.")
  }
})
