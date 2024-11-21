export interface INamedTemplateParser {
  parse<T = any, R = any>(name: string, templateData: T): R
}
