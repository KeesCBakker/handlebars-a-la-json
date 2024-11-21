import { IHandlebars } from "./makeHandlebarsBehave";
export declare function escapeJson(str: any): string;
export interface IOptions {
    numberOfDebugLinesInError: number;
}
export declare const defaultNumberOfDebugLines: Readonly<{
    numberOfDebugLinesInError: 3;
}>;
/**
 * Creates a JSON version of handlebars.
 *
 * @export
 * @param {IOptions} [options=defaultNumberOfDebugLines] Option to inflence errors.
 * @returns {IHandlebars} The Handlebars object.
 */
export declare function createJsonHandlebars(options?: IOptions): IHandlebars;
//# sourceMappingURL=index.d.ts.map