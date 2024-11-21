import { createJsonHandlebars, defaultNumberOfDebugLines, IOptions } from "./templating/createJsonHandlebars"
import { ITemplateDelegate, ICompileOptions, IHandlebars, IRuntimeOptions } from "./templating/makeHandlebarsBehave"
import { escapeJson } from "./templating/utils"

export {
  escapeJson,
  createJsonHandlebars,
  defaultNumberOfDebugLines,
  IOptions,
  ITemplateDelegate,
  ICompileOptions,
  IHandlebars,
  IRuntimeOptions
}
