import { expect } from "chai"
import { escapeJson } from "../../src/templating/utils"

describe("templating/utils.spec.ts", () => {
  it("escape enters", () => {
    // arrange
    const txt = "This\nis\nso\ncool!"

    // act
    const actual = escapeJson(txt)

    // assert
    expect(actual).to.equal("This\\nis\\nso\\ncool!")
  })

  it("escape quotes", () => {
    // arrange
    const txt = 'Einstein: "Uasually I\'m misquoted."'

    // act
    const actual = escapeJson(txt)

    // assert
    expect(actual).to.equal('Einstein: \\"Uasually I\'m misquoted.\\"')
  })
})
