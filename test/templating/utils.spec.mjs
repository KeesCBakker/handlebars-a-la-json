import { strict as assert } from "node:assert"
import { describe, it } from "node:test"
import { escapeJson } from "../../dist/templating/utils.js"

describe("templating/utils.spec.mjs", () => {
  it("escape enters", () => {
    // arrange
    const txt = "This\nis\nso\ncool!"

    // act
    const actual = escapeJson(txt)

    // assert
    assert.equal(actual, "This\\nis\\nso\\ncool!")
  })

  it("escape quotes", () => {
    // arrange
    const txt = 'Einstein: "Uasually I\'m misquoted."'

    // act
    const actual = escapeJson(txt)

    // assert
    assert.equal(actual, 'Einstein: \\"Uasually I\'m misquoted.\\"')
  })
})
