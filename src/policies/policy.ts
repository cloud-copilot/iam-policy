import { Statement, StatementImpl } from '../statements/statement.js'

export interface Policy {
  version(): string | undefined
  id(): string | undefined
  statements(): Statement[]
}

export class PolicyImpl {
  constructor(private readonly policyObject: any) {}

  public version(): string | undefined {
    return this.policyObject.Version
  }

  public id(): string | undefined {
    return this.policyObject.Id
  }

  public statements(): Statement[] {
    return [this.policyObject.Statement].flat().map((statement: any, index) => new StatementImpl(statement, index + 1))
  }
}
