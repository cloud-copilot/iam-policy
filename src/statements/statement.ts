import { Action, ActionImpl, AnnotatedAction } from "../actions/action.js"
import { Annotated, Annotations, AnnotationStore } from "../annotations/annotations.js"
import { Condition, ConditionImpl } from "../conditions/condition.js"
import { AnnotatedPrincipal, Principal, PrincipalImpl, PrincipalType } from "../principals/principal.js"
import { Resource, ResourceImpl } from "../resources/resource.js"

/*
things to change in a statement
principal
notprincipal
resource
notresource
condition
*/


/**
 * Represents a statement in an IAM policy
 */
export interface Statement {

  /**
   * The index of the statement in the policy, starts from 1
   */
  index(): number

  /**
   * The optional Sid (Statement ID) for a statement
   */
  sid(): string | undefined

  /**
   * The effect of the statement, either 'Allow' or 'Deny'
   */
  effect(): string

  /**
   * Is the statement an Allow statement
   */
  isAllow(): boolean

  /**
   * Is the statement a Deny statement
   */
  isDeny(): boolean

  /**
   * The conditions for the statement
   */
  conditions(): Condition[]

  /**
   * Does the statement have a Principal
   */
  isPrincipalStatement(): this is PrincipalStatement

  /**
   * Does the statement have a NotPrincipal
   */
  isNotPrincipalStatement(): this is NotPrincipalStatement

  /**
   * Does the statement have an Action
   */
  isActionStatement(): this is ActionStatement

  /**
   * Does the statement have a NotAction
   */
  isNotActionStatement(): this is NotActionStatement

  /**
   * Does the statement have a Resource
   */
  isResourceStatement(): this is ResourceStatement

  /**
   * Does the statement have a NotResource
   */
  isNotResourceStatement(): this is NotResourceStatement
}

export interface AnnotatedStatement extends Annotated, Statement {
  isActionStatement(): this is AnnotatedActionStatement
  isNotActionStatement(): this is AnnotatedNotActionStatement
  isPrincipalStatement(): this is AnnotatedPrincipalStatement
}

/**
 * Represents a statement in an IAM policy that has Action
 */
export interface ActionStatement extends Statement {
  /**
   * The actions for the statement
   */
  actions(): Action[]
}

/**
 * Represents a statement in an IAM policy that has Action and is annotated
 */
export interface AnnotatedActionStatement extends Annotated, ActionStatement {
  actions(): AnnotatedAction[]
}

/**
 * Represents a statement in an IAM policy that has NotAction
 */
export interface NotActionStatement extends Statement {

  /**
   * The not actions for the statement
   */
  notActions(): Action[]
}

/**
 * Represents a statement in an IAM policy that has NotAction and is annotated
 */
export interface AnnotatedNotActionStatement extends Annotated, NotActionStatement {
  notActions(): AnnotatedAction[]
}


/**
 * Represents a statement in an IAM policy that has Resource
 */
export interface ResourceStatement extends Statement {
  /**
   * The resources for the statement
   */
  resources(): Resource[]

  /**
   * Is the resource element exactly a single wildcard: `"*"`
   */
  hasSingleResourceWildcard(): boolean
}

/**
 * Represents a statement in an IAM policy that has NotResource
 */
export interface NotResourceStatement extends Statement {
  /**
   * The not resources for the statement
   */
  notResources(): Resource[]
}

/**
 * Represents a statement in an IAM policy that has Principal
 */
export interface PrincipalStatement extends Statement {
  /**
   * The principals for the statement
   */
  principals(): Principal[]
}

export interface AnnotatedPrincipalStatement extends Annotated, PrincipalStatement {
  principals(): AnnotatedPrincipal[]
}

/**
 * Represents a statement in an IAM policy that has NotPrincipal
 */
export interface NotPrincipalStatement extends Statement {

  /**
   * The not principals for the statement
   */
  notPrincipals(): Principal[]
}

/**
 * Implementation of the Statement interface and all its sub-interfaces
 */
export class StatementImpl implements Statement, AnnotatedStatement, ActionStatement, AnnotatedStatement, NotActionStatement, ResourceStatement, NotResourceStatement, PrincipalStatement {

  private readonly annotationStore: AnnotationStore
  private actionCache: Action[] | undefined
  private notActionCache: Action[] | undefined
  private principalCache: Principal[] | undefined
  constructor(private readonly statementObject: any, private readonly _index: number, private readonly stateful: boolean) {
    this.annotationStore = new AnnotationStore()
  }

  public addAnnotation(key: string, value: string): void {
    this.annotationStore.addAnnotation(key, value)
  }

  public getAnnotations(): Annotations {
    return this.annotationStore
  }

  public index(): number {
    return this._index
  }

  public sid(): string | undefined {
    return this.statementObject.Sid
  }

  public effect(): string {
    return this.statementObject.Effect
  }

  public isAllow(): boolean {
    return this.effect() === 'Allow'
  }

  public isDeny(): boolean {
    return this.effect() === 'Deny'
  }

  public isPrincipalStatement(): this is PrincipalStatement
  public isPrincipalStatement(): this is AnnotatedPrincipalStatement
  public isPrincipalStatement(): this is PrincipalStatement {
    return this.statementObject.Principal !== undefined;
  }

  public isNotPrincipalStatement(): this is NotPrincipalStatement {
    return this.statementObject.NotPrincipal !== undefined;
  }

  public principals(): Principal[]
  public principals(): AnnotatedPrincipal[]
  public principals(): Principal[] | AnnotatedPrincipal[] {
    if(!this.isPrincipalStatement()) {
      throw new Error('Called principals on a statement without Principal, use isPrincipalStatement before calling principals')
    }
    if(!this.stateful) {
      return this.parsePrincipalObject(this.statementObject.Principal)
    }
    if(!this.principalCache) {
      this.principalCache = this.parsePrincipalObject(this.statementObject.Principal)
    }
    return this.principalCache
  }

  public notPrincipals(): Principal[] {
    if(!this.isNotPrincipalStatement()) {
      throw new Error('Called notPrincipals on a statement without NotPrincipal, use isNotPrincipalStatement before calling notPrincipals')
    }
    return this.parsePrincipalObject(this.statementObject.NotPrincipal)
  }

  /**
   * Parse the principal object into PrincipalImpl objects.
   *
   * This is non trivial and we don't want to implement this in each function.
   *
   * @param principals the Principal or NotPrincipal object ot parse
   * @returns the backing principals for a Principal or NotPrincipal object
   */
  private parsePrincipalObject(principals: any): PrincipalImpl[] {
    if(typeof principals === 'string') {
      return [new PrincipalImpl('AWS', principals)]
    }
    return Object.entries(principals).map(([principalType, principalValue]) => {
      if(typeof principalValue === 'string') {
        return new PrincipalImpl(principalType as PrincipalType, principalValue)
      }
      return Object.entries(principalValue as any).map(([key, value]) => {
        return new PrincipalImpl(principalType as PrincipalType, value as string)
      })
    }).flat()
  }

  public isActionStatement(): this is AnnotatedActionStatement
  public isActionStatement(): this is ActionStatement {
    return this.statementObject.Action !== undefined;
  }

  public isNotActionStatement(): this is AnnotatedNotActionStatement
  public isNotActionStatement(): this is NotActionStatement {
    return this.statementObject.NotAction !== undefined;
  }

  public actions(): Action[]
  public actions(): AnnotatedAction[]
  public actions(): Action[] | AnnotatedAction[] {
    if(!this.isActionStatement()) {
      throw new Error('Called actions on a statement without Action, use isActionStatement before calling actions')
    }
    if(!this.stateful) {
      return this.createNewActions()
    }
    if(!this.actionCache) {
      this.actionCache = this.createNewActions()
    }
    return this.actionCache
  }

  private createNewActions(): Action[] {
    return [this.statementObject.Action].flat().map((action: any) => new ActionImpl(action))
  }

  public notActions(): Action[]
  public notActions(): AnnotatedAction[]
  public notActions(): Action[] | AnnotatedAction[] {
    if(!this.isNotActionStatement()) {
      throw new Error('Called notActions on a statement without NotAction, use isNotActionStatement before calling notActions')
    }
    if(!this.stateful) {
      return this.createNewNotActions()
    }
    if(!this.notActionCache) {
      this.notActionCache = this.createNewNotActions()
    }
    return this.notActionCache
  }

  private createNewNotActions(): Action[] {
    return [this.statementObject.NotAction].flat().map((action: any) => new ActionImpl(action))
  }

  public isResourceStatement(): this is ResourceStatement {
    return this.statementObject.Resource !== undefined;
  }

  public isNotResourceStatement(): this is NotResourceStatement {
    return this.statementObject.NotResource !== undefined;
  }

  public resources(): Resource[] {
    if(!this.isResourceStatement()) {
      throw new Error('Called resources on a statement without Resource, use isResourceStatement before calling resources')
    }
    return [this.statementObject.Resource].flat().map((resource: any) => new ResourceImpl(resource))
  }

  public notResources(): Resource[] {
    if(!this.isNotResourceStatement()) {
      throw new Error('Called notResources on a statement without NotResource, use isNotResourceStatement before calling notResources')
    }
    return [this.statementObject.NotResource].flat().map((resource: any) => new ResourceImpl(resource))
  }

  public hasSingleResourceWildcard(): boolean {
    if(!this.isResourceStatement()) {
      throw new Error('Called hasSingleResourceWildcard on a statement without Resource, use isResourceStatement before calling hasSingleResourceWildcard')
    }
    return this.isResourceStatement() && this.statementObject.Resource === '*'
  }

  public conditions(): Condition[] {
    if(!this.statementObject.Condition) {
      return []
    }

    return Object.entries(this.statementObject.Condition).map(([opKey, opValue]) => {
      return Object.entries(opValue as any).map(([condKey, condValue]) => {
        return new ConditionImpl(opKey, condKey, condValue as string | string[])
      })
    }).flat()
  }
}