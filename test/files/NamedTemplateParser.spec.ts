import { expect } from "chai"
import { create as createDefaultHandlebars } from "handlebars"
import { NamedTemplateParser } from "../../src/files/NamedTemplateParser"
import { createJsonHandlebars } from "../../src/templating/createJsonHandlebars"

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
})
