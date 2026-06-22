import { describe, expect, it } from 'vitest'
import {
  caseInsensitiveEndsWith,
  caseInsensitiveEquals,
  delimitedSegmentAt,
  delimitedSegmentRemainder,
  lastDelimitedSegment
} from './utils.js'

describe('caseInsensitiveEquals', () => {
  it('returns true when values only differ by case', () => {
    //Given two strings with the same letters in different cases
    const first = 'ForAllValues'
    const second = 'forallvalues'

    //When the strings are compared case-insensitively
    const result = caseInsensitiveEquals(first, second)

    //Then they are treated as equal
    expect(result).toBe(true)
  })

  it('returns false when values differ by more than case', () => {
    //Given two different strings
    const first = 'ForAllValues'
    const second = 'ForAnyValue'

    //When the strings are compared case-insensitively
    const result = caseInsensitiveEquals(first, second)

    //Then they are not treated as equal
    expect(result).toBe(false)
  })
})

describe('caseInsensitiveEndsWith', () => {
  it('returns true when the value ends with the suffix in a different case', () => {
    //Given a value ending with a differently-cased suffix
    const value = 'StringEqualsIFEXISTS'

    //When the suffix is checked case-insensitively
    const result = caseInsensitiveEndsWith(value, 'IfExists')

    //Then the suffix is found
    expect(result).toBe(true)
  })

  it('returns false when the value does not end with the suffix', () => {
    //Given a value without the requested suffix
    const value = 'StringEquals'

    //When the suffix is checked case-insensitively
    const result = caseInsensitiveEndsWith(value, 'IfExists')

    //Then the suffix is not found
    expect(result).toBe(false)
  })
})

describe('delimitedSegmentAt', () => {
  it('returns the segment at the requested index', () => {
    //Given a colon-delimited ARN-like value
    const value = 'arn:aws:iam::123456789012:role/example'

    //When the account segment is requested
    const result = delimitedSegmentAt(value, ':', 4)

    //Then the requested segment is returned
    expect(result).toBe('123456789012')
  })

  it('returns undefined when the requested segment is missing', () => {
    //Given a delimited value with two segments
    const value = 'service:Action'

    //When a later segment is requested
    const result = delimitedSegmentAt(value, ':', 2)

    //Then no segment is returned
    expect(result).toBeUndefined()
  })
})

describe('lastDelimitedSegment', () => {
  it('returns the final segment after the last delimiter', () => {
    //Given a value with repeated delimiters
    const value = 'ForAllValues:StringEquals:IfExists'

    //When the final segment is requested
    const result = lastDelimitedSegment(value, ':')

    //Then only the final segment is returned
    expect(result).toBe('IfExists')
  })

  it('returns the whole value when no delimiter exists', () => {
    //Given a value without delimiters
    const value = 'StringEquals'

    //When the final segment is requested
    const result = lastDelimitedSegment(value, ':')

    //Then the whole value is returned
    expect(result).toBe('StringEquals')
  })
})

describe('delimitedSegmentRemainder', () => {
  it('returns the remainder starting at the requested segment', () => {
    //Given an ARN with a resource containing colons
    const value = 'arn:aws:lambda:us-east-1:123456789012:function:name:alias'

    //When the resource remainder is requested
    const result = delimitedSegmentRemainder(value, ':', 5)

    //Then the colons inside the resource are preserved
    expect(result).toBe('function:name:alias')
  })

  it('returns undefined when the starting segment is missing', () => {
    //Given a delimited value with two segments
    const value = 'service:Action'

    //When a later remainder is requested
    const result = delimitedSegmentRemainder(value, ':', 2)

    //Then no remainder is returned
    expect(result).toBeUndefined()
  })
})
