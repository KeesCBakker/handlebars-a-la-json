import fs from "fs"
import path from "path"
import { INamedTemplateParser } from "./INamedTemplateParser"
import { IHandlebars, ITemplateDelegate } from "../templating/makeHandlebarsBehave"

export class NamedTemplateParser implements INamedTemplateParser {
  private templates: Record<string, ITemplateDelegate<any>> = {}

  constructor(public handlebars: IHandlebars) {}

  async loadTemplatesFromDirectory(templateDirectory: string): Promise<void> {
    let files = await fs.promises.readdir(templateDirectory)
    files = files.filter(f => f.endsWith(".handlebars") || f.endsWith(".hbs"))
    for (let file of files) {
      const filePath = path.join(templateDirectory, file)
      const contents = await fs.promises.readFile(filePath)
      this.process(file, contents.toString())
    }
  }

  parse<T = any, R = any>(name: string, templateData: T): R {
    const compileTemplate = this.templates[name]
    if (!compileTemplate) throw "Template not found: " + name

    try {
      return compileTemplate(templateData) as R
    } catch (ex) {
      throw new Error(`Template invalid '${name}'. Message: "${ex}". Stack:\n${ex.stack}\n`)
    }
  }

  addNamedTemplate(name: string, contents: string) {
    this.templates[name] = this.handlebars.compile(contents)
    this.handlebars.registerPartial(name, contents)
  }

  private process(fileName: string, contents: string) {
    const compiledTemplate = this.handlebars.compile(contents)

    this.templates[fileName] = compiledTemplate
    this.handlebars.registerPartial(fileName, contents)

    const alternative = fileName.replace(".handlebars", "").replace(".hbs", "")
    this.templates[alternative] = compiledTemplate
    this.handlebars.registerPartial(alternative, contents)
  }
}
