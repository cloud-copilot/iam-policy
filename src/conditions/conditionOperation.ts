import {
  caseInsensitiveEndsWith,
  caseInsensitiveEquals,
  delimitedSegmentAt,
  lastDelimitedSegment
} from '../utils.js'

export type SetOperator = 'ForAllValues' | 'ForAnyValue'

/**
 * ConditionOperation is a string that represents the operation of a condition.
 */
export interface ConditionOperation {
  /**
   * Returns the set modifier if present.
   */
  setOperator(): SetOperator | undefined

  /**
   * Returns the base operator of the condition without the set modifier or IfExists.
   */
  baseOperator(): string

  /**
   * Returns true if the condition operation ends with IfExists.
   */
  isIfExists(): boolean

  /**
   * Returns the raw string of the condition operation.
   */
  value(): string
}

const ifExistsSlice = 'IfExists'.length * -1

export class ConditionOperationImpl implements ConditionOperation {
  constructor(private readonly op: string) {}

  public setOperator(): SetOperator | undefined {
    if (!this.op.includes(':')) {
      return undefined
    }
    const setOp = delimitedSegmentAt(this.op, ':', 0)!
    if (caseInsensitiveEquals(setOp, 'ForAllValues')) {
      return 'ForAllValues'
    } else if (caseInsensitiveEquals(setOp, 'ForAnyValue')) {
      return 'ForAnyValue'
    }
    throw new Error(`Unknown set operator: ${setOp}`)
  }

  public isIfExists(): boolean {
    return caseInsensitiveEndsWith(this.op, 'IfExists')
  }

  public baseOperator(): string {
    const base = lastDelimitedSegment(this.op, ':')
    if (caseInsensitiveEndsWith(base, 'IfExists')) {
      return base.slice(0, ifExistsSlice)
    }
    return base
  }

  public value(): string {
    return this.op
  }
}
