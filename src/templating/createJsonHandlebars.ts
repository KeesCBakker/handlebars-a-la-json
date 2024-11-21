import decache from "decache"

decache("handlebars")
import { create as createDefaultHandlebars } from "handlebars"
decache("handlebars")

import { safeJsonParse } from "better-error-message-for-json-parse"
import { IHandlebars, ICompileOptions } from "./makeHandlebarsBehave"
import { escapeJson } from "./utils"

export interface IOptions {
  numberOfDebugLinesInError: number
}

export const defaultNumberOfDebugLines = Object.freeze({
  numberOfDebugLinesInError: 3
})

/**
 * Creates a JSON version of handlebars.
 *
 * @export
 * @param {IOptions} [options=defaultNumberOfDebugLines] Option to influence errors.
 * @returns {IHandlebars} The Handlebars object.
 */
export function createJsonHandlebars(options: IOptions = defaultNumberOfDebugLines): IHandlebars {
  const myErrorOptions = options

  const instance = createDefaultHandlebars()
  instance.Utils.escapeExpression = escapeJson
  ;(<any>instance).create = createJsonHandlebars
  ;(<any>instance).__def__compile = instance.compile
  ;(<any>instance).compile = (input: any, options?: ICompileOptions) => {
    const compiled = (<any>instance).__def__compile(input, options)
    return (context: any, options: any): any => {
      let result = compiled(context, options)
      result = reformatJsonString(result)

      if (result.startsWith('"') || result.startsWith("'")) {
        return result
      }

      try {
        result = safeJsonParse(result)
        return result
      } catch (ex) {
        ex = changeError(ex, result, myErrorOptions)
        throw ex
      }
    }
  }
  return instance
}

function reformatJsonString(str: string) {
  // replace enters
  str = str.replace(/\r/g, "")

  // skip empty line
  str = str
    .split("\n")
    .filter(l => !/^\s*$/.test(l))
    .join("\n")

  // replace lines that only have a comma - they are hard to debug
  str = str.replace(/\n\s*,\s*\n/g, ",\n")

  return str
}

function changeError(ex: Error, json: string, options: IOptions) {
  const DIFF = options?.numberOfDebugLinesInError || 3

  let strings = json.split("\n")
  let messages = ex.message.split("\n")
  let firstMsg = messages.shift()

  let firstRangeEnd = parseInt(messages[1]) - 2
  let firstRangeStart = firstRangeEnd - DIFF
  if (firstRangeStart < 0) firstRangeStart = 0

  for (let index = firstRangeStart; index < firstRangeEnd; index++) {
    let msg = `${index + 1}: ${strings[index]}`
    let offset = index - firstRangeStart
    messages.splice(offset, 0, msg)
  }

  let lastRangeStart = parseInt(messages[messages.length - 1])
  let lastRangeEnd = lastRangeStart + DIFF
  if (lastRangeEnd >= strings.length) lastRangeEnd = strings.length - 1

  for (let index = lastRangeStart; index <= lastRangeEnd; index++) {
    let msg = `${index + 1}: ${strings[index]}`
    messages.push(msg)
  }

  messages.unshift(firstMsg)
  ex.message = messages.join("\n")

  return ex
}
