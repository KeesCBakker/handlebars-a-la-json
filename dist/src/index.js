"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNumberOfDebugLines = void 0;
exports.escapeJson = escapeJson;
exports.createJsonHandlebars = createJsonHandlebars;
const decache_1 = __importDefault(require("decache"));
(0, decache_1.default)("handlebars");
const handlebars_1 = require("handlebars");
(0, decache_1.default)("handlebars");
const better_error_message_for_json_parse_1 = require("better-error-message-for-json-parse");
function escapeJson(str) {
    str = str ? str.toString() : '';
    return str
        .replace(/\\/g, "\\\\")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r");
}
exports.defaultNumberOfDebugLines = Object.freeze({
    numberOfDebugLinesInError: 3
});
;
/**
 * Creates a JSON version of handlebars.
 *
 * @export
 * @param {IOptions} [options=defaultNumberOfDebugLines] Option to inflence errors.
 * @returns {IHandlebars} The Handlebars object.
 */
function createJsonHandlebars(options = exports.defaultNumberOfDebugLines) {
    const instance = (0, handlebars_1.create)();
    instance.Utils.escapeExpression = escapeJson;
    instance.create = createJsonHandlebars;
    instance.__def__compile = instance.compile;
    instance.compile = (input, options) => {
        const compiled = instance.__def__compile(input, options);
        return (context, options) => {
            let result = compiled(context, options);
            result = reformatJsonString(result);
            try {
                return (0, better_error_message_for_json_parse_1.safeJsonParse)(result);
            }
            catch (ex) {
                ex = changeError(ex, result, options);
                throw ex;
            }
        };
    };
    return instance;
}
function reformatJsonString(str) {
    // replace enters
    str = str.replace(/\r/g, '');
    // skip empty line
    str = str.split('\n').filter(l => !/^\s*$/.test(l)).join('\n');
    // replace lines that only have a comma - they are hard to debug
    str = str.replace(/\n\s*,\s*\n/g, ',\n');
    return str;
}
function changeError(ex, json, options) {
    const DIFF = options ? options.numberOfDebugLinesInError ? options.numberOfDebugLinesInError : 3 : 3;
    let jsons = json.split('\n');
    let messages = ex.message.split('\n');
    let firstMsg = messages.shift();
    let firstRangeEnd = parseInt(messages[1]) - 2;
    let firstRangeStart = firstRangeEnd - DIFF;
    if (firstRangeStart < 0)
        firstRangeStart = 0;
    for (let index = firstRangeStart; index < firstRangeEnd; index++) {
        let msg = `${index + 1}: ${jsons[index]}`;
        let offset = index - firstRangeStart;
        messages.splice(offset, 0, msg);
    }
    let lastRangeStart = parseInt(messages[messages.length - 1]);
    let lastRangeEnd = lastRangeStart + DIFF;
    if (lastRangeEnd >= jsons.length)
        lastRangeEnd = jsons.length - 1;
    for (let index = lastRangeStart; index <= lastRangeEnd; index++) {
        let msg = `${index + 1}: ${jsons[index]}`;
        messages.push(msg);
    }
    messages.unshift(firstMsg);
    ex.message = messages.join('\n');
    return ex;
}
//# sourceMappingURL=index.js.map