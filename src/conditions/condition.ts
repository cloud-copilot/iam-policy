export interface Condition {
  operation(): string
  conditionKey(): string
  conditionValues(): string[]
}

export class ConditionImpl implements Condition{
  constructor(private readonly op: string, private readonly key: string, private readonly values: string | string[]) {}

  public operation(): string {
    return this.op
  }

  public conditionKey(): string {
    return this.key
  }

  public conditionValues(): string[] {
    return typeof this.values === 'string' ? [this.values] : this.values
  }
}