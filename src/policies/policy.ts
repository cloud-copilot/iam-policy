import { Statement, StatementImpl } from '../statements/statement.js'

export interface Policy<T = undefined> {
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

  /**
   * The raw policy object as JSON
   */
  toJSON(): any

  /**
   * Metadata is any object to store additional information about the policy.
   * Up to you as a user to define the type of the metadata and is optional.
   */
  metadata(): T
}

export class PolicyImpl<T = undefined> implements Policy<T> {
  constructor(
    private readonly policyObject: any,
    private readonly theMetadata?: T
  ) {}

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
    if (!this.statementIsArray()) {
      return [new StatementImpl(this.policyObject.Statement, 1, { path: 'Statement' })]
    }
    return [this.policyObject.Statement].flat().map((statement: any, index) => {
      return new StatementImpl(statement, index + 1, { path: `Statement[${index}]` })
    })
  }

  public statementIsArray(): boolean {
    return Array.isArray(this.policyObject.Statement)
  }

  public toJSON(): any {
    return this.policyObject
  }

  public metadata(): T {
    return this.theMetadata as T
  }
}
