import { ConditionOperation, ConditionOperationImpl } from './conditionOperation.js'

export interface Condition {
  /**
   * Returns the operation of the condition. For example "StringEquals" or "StringLike".
   *
   * @returns the operation of the condition.
   */
  operation(): ConditionOperation

  /**
   * Returns the key of the condition. For example "aws:PrincipalOrgID".
   *
   * @returns the condition key of the action
   */
  conditionKey(): string

  /**
   * Returns the values of the condition. For example ["o-1234567890abcdef0"].
   *
   * @returns the values of the condition.
   */
  conditionValues(): string[]

  /**
   * Checks if the the condition values are an array.
   *
   * @returns true if the condition values are an array, false otherwise.
   */
  valueIsArray(): boolean

  /**
   * Returns the path to the operator key in the policy.
   */
  operatorKeyPath(): string

  /**
   * Returns the path to the operator value in the policy.
   */
  operatorValuePath(): string

  /**
   * Returns the path to the condition key for the policy.
   */
  keyPath(): string

  /**
   * Returns the path to the condition values in the policy.
   */
  valuesPath(): string
}

export class ConditionImpl implements Condition {
  constructor(
    private readonly op: string,
    private readonly key: string,
    private readonly values: string | string[],
    private readonly otherProps: {
      conditionPath: string
    }
  ) {}

  public operation(): ConditionOperation {
    return new ConditionOperationImpl(this.op)
  }

  public conditionKey(): string {
    return this.key
  }

  public conditionValues(): string[] {
    return typeof this.values === 'string' ? [this.values] : this.values
  }

  public valueIsArray(): boolean {
    return Array.isArray(this.values)
  }

  public operatorKeyPath(): string {
    return `${this.otherProps.conditionPath}.#${this.op}`
  }

  public operatorValuePath(): string {
    return `${this.otherProps.conditionPath}.${this.op}`
  }

  public keyPath(): string {
    return `${this.otherProps.conditionPath}.${this.op}.#${this.key}`
  }

  public valuesPath(): string {
    return `${this.otherProps.conditionPath}.${this.op}.${this.key}`
  }
}
