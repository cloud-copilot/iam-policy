import { Annotated, Annotations, AnnotationStore } from '../annotations/annotations.js'
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
}

export interface AnnotatedCondition extends Condition, Annotated {}

export class ConditionImpl implements Condition, AnnotatedCondition {
  private readonly annotations: AnnotationStore = new AnnotationStore()
  constructor(
    private readonly op: string,
    private readonly key: string,
    private readonly values: string | string[]
  ) {}

  public addAnnotation(key: string, value: string): void {
    this.annotations.addAnnotation(key, value)
  }

  public getAnnotations(): Annotations {
    return this.annotations
  }

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
}
