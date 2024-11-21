export function escapeJson(str: any): string {
  str = str ? str.toString() : ""
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\t/g, "\\t")
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
}
