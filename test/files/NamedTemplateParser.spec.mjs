import { strict as assert } from "node:assert"
import { describe, it } from "node:test"
import handlebarsPackage from "handlebars"
import { NamedTemplateParser } from "../../dist/files/NamedTemplateParser.js"
import { createJsonHandlebars } from "../../dist/templating/createJsonHandlebars.js"
import fs from "node:fs"

const createDefaultHandlebars = handlebarsPackage.create

describe("files/NamedTemplateParser.spec.mjs", () => {
  it("Parse directory async", async () => {
    // arrange
    const handlebars = createDefaultHandlebars()
    const parser = new NamedTemplateParser(handlebars)
    await parser.loadTemplatesFromDirectory("./test/files/templates/")

    // act
    const actual = parser.parse("main", { items: [{ name: "Alpha" }, { name: "Beta" }] })

    // assert
    const expected = `This is a list: Alpha, Beta`
    assert.equal(actual, expected)
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
    assert.equal(actual, expected)
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
    assert.equal(actual.count, 2)
    assert.deepEqual(actual.list, ["-Alpha", "-Beta"])
  })

  it("Invalid home", async () => {
    // arrange
    const handlebars = createJsonHandlebars()
    const parser = new NamedTemplateParser(handlebars)
    const template = await fs.promises.readFile(import.meta.dirname + "/../files/templates/broken-home.handlebars")

    parser.addNamedTemplate("broken-home", template.toString())

    // act
    assert.throws(() => parser.parse("broken-home", {}), (ex) => {
      assert.equal(ex.message, "Template invalid: broken-home")
      assert.equal(ex.cause.message, `Expected ',' or '}' after property value in JSON at position 434 (line 21 column 8)
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

  it("Test debug file", async () => {
    // arrange
    const debugFilePath = import.meta.dirname + "/test.tmp"

    if (fs.existsSync(debugFilePath)) {
      fs.rmSync(debugFilePath);
    }

    const options = { numberOfDebugLinesInError: 3, debugFilePath }
    const handlebars = createJsonHandlebars(options)
    const parser = new NamedTemplateParser(handlebars)
    const template = await fs.promises.readFile(import.meta.dirname + "/../files/templates/broken-home.handlebars")

    parser.addNamedTemplate("broken-home", template.toString())

    try {
      assert.throws(() => parser.parse("broken-home", {}), { message: "Template invalid: broken-home" })
      assert.ok(fs.existsSync(debugFilePath))
    } finally {
      if (fs.existsSync(debugFilePath)) {
        fs.rmSync(debugFilePath);
      }
    }
  })
})
