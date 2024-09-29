import { ConditionOperation, ConditionOperationImpl } from "./conditionOperation.js"

export interface Condition {
  operation(): ConditionOperation
  conditionKey(): string
  conditionValues(): string[]
}

export class ConditionImpl implements Condition{
  constructor(private readonly op: string, private readonly key: string, private readonly values: string | string[]) {}

  public operation(): ConditionOperation {
    return new ConditionOperationImpl(this.op)
  }

  public conditionKey(): string {
    return this.key
  }

  public conditionValues(): string[] {
    return typeof this.values === 'string' ? [this.values] : this.values
  }
}

