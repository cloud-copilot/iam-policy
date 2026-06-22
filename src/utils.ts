/**
 * Checks if a string is all wildcards(*)
 *
 * @param value The value to check if it is a wildcard
 * @returns True if the value is all wildcards, false otherwise
 */
export function isAllWildcards(value: string): boolean {
  return value.match(/^\*+$/) !== null
}

/**
 * Returns the segment at the requested zero-based index without allocating an
 * array for every segment in the value.
 *
 * @param value - the delimited string to read from
 * @param delimiter - the delimiter that separates segments
 * @param segmentIndex - the zero-based segment index to return
 * @returns the requested segment, or undefined when the index is not present
 */
export function delimitedSegmentAt(
  value: string,
  delimiter: string,
  segmentIndex: number
): string | undefined {
  let segmentStart = 0
  for (let currentIndex = 0; currentIndex < segmentIndex; currentIndex++) {
    const delimiterIndex = value.indexOf(delimiter, segmentStart)
    if (delimiterIndex === -1) {
      return undefined
    }
    segmentStart = delimiterIndex + delimiter.length
  }

  const segmentEnd = value.indexOf(delimiter, segmentStart)
  if (segmentEnd === -1) {
    return value.slice(segmentStart)
  }
  return value.slice(segmentStart, segmentEnd)
}

/**
 * Returns the last segment of a delimited string without allocating an array for
 * all preceding segments.
 *
 * @param value - the delimited string to read from
 * @param delimiter - the delimiter that separates segments
 * @returns the final segment after the last delimiter, or the whole value if no delimiter exists
 */
export function lastDelimitedSegment(value: string, delimiter: string): string {
  const delimiterIndex = value.lastIndexOf(delimiter)
  if (delimiterIndex === -1) {
    return value
  }
  return value.slice(delimiterIndex + delimiter.length)
}

/**
 * Returns the remainder of a delimited string starting at the requested
 * zero-based segment index.
 *
 * @param value - the delimited string to read from
 * @param delimiter - the delimiter that separates segments
 * @param segmentIndex - the zero-based segment index where the remainder starts
 * @returns the substring starting at the requested segment, or undefined when the segment is not present
 */
export function delimitedSegmentRemainder(
  value: string,
  delimiter: string,
  segmentIndex: number
): string | undefined {
  let segmentStart = 0
  for (let currentIndex = 0; currentIndex < segmentIndex; currentIndex++) {
    const delimiterIndex = value.indexOf(delimiter, segmentStart)
    if (delimiterIndex === -1) {
      return undefined
    }
    segmentStart = delimiterIndex + delimiter.length
  }
  return value.slice(segmentStart)
}

const caseInsensitiveCompareOptions: Intl.CollatorOptions = { sensitivity: 'accent' }

/**
 * Compares two strings without case sensitivity and without lowercasing either
 * value first.
 *
 * @param first - the first string to compare
 * @param second - the second string to compare
 * @returns true when both strings match case-insensitively
 */
export function caseInsensitiveEquals(first: string, second: string): boolean {
  return first.localeCompare(second, undefined, caseInsensitiveCompareOptions) === 0
}

/**
 * Checks whether a value ends with a suffix without case sensitivity and
 * without lowercasing the value first.
 *
 * @param value - the value to check
 * @param suffix - the suffix to compare against the end of the value
 * @returns true when the value ends with the suffix case-insensitively
 */
export function caseInsensitiveEndsWith(value: string, suffix: string): boolean {
  return caseInsensitiveEquals(value.slice(suffix.length * -1), suffix)
}
