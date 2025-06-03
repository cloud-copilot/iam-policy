/**
 * Checks if a string is all wildcards(*)
 *
 * @param value The value to check if it is a wildcard
 * @returns True if the value is all wildcards, false otherwise
 */
export function isAllWildcards(value: string): boolean {
  return value.match(/^\*+$/) !== null
}
