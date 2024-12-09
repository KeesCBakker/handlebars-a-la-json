import { expect } from "chai"
import { create as createDefaultHandlebars } from "handlebars"
import { NamedTemplateParser } from "../../src/files/NamedTemplateParser"
import { createJsonHandlebars } from "../../src/templating/createJsonHandlebars"
import fs from "fs"

describe("files/NamedTemplateParser.spec.ts", () => {
  it("Parse directory async", async () => {
    // arrange
    const handlebars = createDefaultHandlebars()
    const parser = new NamedTemplateParser(handlebars)
    await parser.loadTemplatesFromDirectory("./test/files/templates/")

    // act
    const actual = parser.parse("main", { items: [{ name: "Alpha" }, { name: "Beta" }] })

    // assert
    const expected = `This is a list: Alpha, Beta`
    expect(actual).to.eq(expected)
  })

  it("Manually added + partials", () => {
    // arrange
    const handlebars = createDefaultHandlebars()
    const parser = new NamedTemplateParser(handlebars)
    parser.addNamedTemplate("main", "This is a list: {{#items}}{{> include}}{{#unless @last}}, {{/unless}}{{/items}}")
    parser.addNamedTemplate("include", "{{name}}")

    // act
    const actual = parser.parse("main", { items: [{ name: "Alpha" }, { name: "Beta" }] })

    // assert
    const expected = `This is a list: Alpha, Beta`
    expect(actual).to.eq(expected)
  })

  it("JSON integration + partials", () => {
    // arrange
    const handlebars = createJsonHandlebars()
    const parser = new NamedTemplateParser(handlebars)
    parser.addNamedTemplate(
      "main",
      '{ "count": {{items.length}}, "list": [{{#items}}{{> include}}{{#unless @last}}, {{/unless}}{{/items}}] }'
    )
    parser.addNamedTemplate("include", '"-{{name}}"')

    // act
    const actual = parser.parse("main", { items: [{ name: "Alpha" }, { name: "Beta" }] })

    // assert
    expect(actual.count).to.eq(2)
    expect(actual.list).to.deep.eq(["-Alpha", "-Beta"])
  })

  it("Invalid home", async () => {
    // arrange
    const handlebars = createJsonHandlebars()
    const parser = new NamedTemplateParser(handlebars)
    const template = await fs.promises.readFile(__dirname + "/../files/templates/broken-home.handlebars")

    parser.addNamedTemplate("broken-home", template.toString())

    // act
    try {
      parser.parse("broken-home", {})
    } catch (ex) {
      // assert
      expect(ex.message).to.eq("Template invalid: broken-home")
      expect(ex.cause.message).to.eq(`Expected ',' or '}' after property value in JSON at position 434
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
