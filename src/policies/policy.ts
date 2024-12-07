import { Annotated, Annotations, AnnotationStore } from '../annotations/annotations.js'
import { AnnotatedStatement, Statement, StatementImpl } from '../statements/statement.js'

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

export interface AnnotatedPolicy extends Policy, Annotated {
  statements(): AnnotatedStatement[]
}

export class PolicyImpl implements Policy, AnnotatedPolicy {

  private readonly annotationStore: AnnotationStore
  private statementsCache: Statement[] | undefined
  constructor(private readonly policyObject: any, private readonly stateful: boolean) {
    this.annotationStore = new AnnotationStore()
  }

  public version(): string | undefined {
    return this.policyObject.Version
  }

  public id(): string | undefined {
    return this.policyObject.Id
  }

  public statements(): Statement[];
  public statements(): AnnotatedStatement[];
  public statements(): Statement[] | AnnotatedStatement[] {
    if(!this.stateful) {
      return this.newStatements()
    }

    if(!this.statementsCache) {
      this.statementsCache = this.newStatements()
    }
    return this.statementsCache
  }

  private newStatements(): Statement[] {
    return [this.policyObject.Statement].flat().map((statement: any, index) => new StatementImpl(statement, index + 1, this.stateful))
  }

  public addAnnotation(key: string, value: string): void {
    this.annotationStore.addAnnotation(key, value)
  }

  public getAnnotations(): Annotations {
    return this.annotationStore
  }

  public statementIsArray(): boolean {
    return Array.isArray(this.policyObject.Statement)
  }
}