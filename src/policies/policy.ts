import { Statement, StatementImpl } from '../statements/statement.js'

export interface Policy {
  /**
   * The version of the policy
   */
  version(): string | undefined

  /**
   * The ID of the policy
   */
  id(): string | undefined

  /**
   * The statements in the policy
   */
  statements(): Statement[]

  /**
   * Whether the statement is an array
   */
  statementIsArray(): boolean
}

export class PolicyImpl implements Policy {
  constructor(private readonly policyObject: any) {}

  public version(): string | undefined {
    return this.policyObject.Version
  }

  public id(): string | undefined {
    return this.policyObject.Id
  }

  public statements(): Statement[] {
    return this.newStatements()
  }

  private newStatements(): Statement[] {
    return [this.policyObject.Statement]
      .flat()
      .map((statement: any, index) => new StatementImpl(statement, index + 1))
  }

  public statementIsArray(): boolean {
    return Array.isArray(this.policyObject.Statement)
  }
}
