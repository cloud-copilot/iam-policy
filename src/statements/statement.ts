import { Action, ActionImpl } from '../actions/action.js'
import { Condition, ConditionImpl } from '../conditions/condition.js'
import { Principal, PrincipalImpl, PrincipalType } from '../principals/principal.js'
import { Resource, ResourceImpl } from '../resources/resource.js'

/*
things to change in a statement
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
   * The conditions of the statement as a map similar to the AWS IAM policy document.
   * In this case all condition values are arrays, instead of strings or arrays.
   */
  conditionMap(): Record<string, Record<string, string[]>> | undefined

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

  /**
   * The path to the statement in the policy
   */
  path(): string
}

/**
 * Represents a statement in an IAM policy that has Action
 */
export interface ActionStatement extends Statement {
  /**
   * The actions for the statement
   */
  actions(): Action[]

  /**
   * Is the Action element an array of strings
   */
  actionIsArray(): boolean
}

/**
 * Represents a statement in an IAM policy that has NotAction
 */
export interface NotActionStatement extends Statement {
  /**
   * The not actions for the statement
   */
  notActions(): Action[]

  /**
   * Is the NotAction element an array of strings
   */
  notActionIsArray(): boolean
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
   * Is the Resource element exactly a single wildcard: `"*"`
   */
  hasSingleResourceWildcard(): boolean

  /**
   * Is the Resource element an array of strings
   */
  resourceIsArray(): boolean
}

/**
 * Represents a statement in an IAM policy that has NotResource
 */
export interface NotResourceStatement extends Statement {
  /**
   * The not resources for the statement
   */
  notResources(): Resource[]

  /**
   * Is the NotResource element exactly a single wildcard: `"*"`
   */
  hasSingleNotResourceWildcard(): boolean

  /**
   * Is the resource element an array of strings
   */
  notResourceIsArray(): boolean
}

/**
 * Represents a statement in an IAM policy that has Principal
 */
export interface PrincipalStatement extends Statement {
  /**
   * The principals for the statement
   */
  principals(): Principal[]

  /**
   * Is the Principal type is an array of strings
   *
   * @param principalType the type of the Principal such as "AWS", "Service", etc.
   * @returns true if the principal type is an array of strings in the raw policy
   */
  principalTypeIsArray(principalType: string): boolean

  /**
   * Is the Principal element a single wildcard: `"*"`
   */
  hasSingleWildcardPrincipal(): boolean
}

/**
 * Represents a statement in an IAM policy that has NotPrincipal
 */
export interface NotPrincipalStatement extends Statement {
  /**
   * The not principals for the statement
   */
  notPrincipals(): Principal[]

  /**
   * Is the NotPrincipal type is an array of strings
   *
   * @param notPrincipalType the type of the NotPrincipal such as "AWS", "Service", etc.
   * @returns true if the NotPrincipal type is an array of strings in the raw policy
   */
  notPrincipalTypeIsArray(notPrincipalType: string): boolean

  /**
   * Is the NotPrincipal element a single wildcard: `"*"`
   */
  hasSingleWildcardNotPrincipal(): boolean
}

/**
 * Implementation of the Statement interface and all its sub-interfaces
 */
export class StatementImpl
  implements
    Statement,
    ActionStatement,
    NotActionStatement,
    ResourceStatement,
    NotResourceStatement,
    PrincipalStatement
{
  constructor(
    private readonly statementObject: any,
    private readonly _index: number,
    private readonly otherProps: {
      path: string
    }
  ) {}

  public index(): number {
    return this._index
  }

  public path(): string {
    return this.otherProps.path
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

  public isPrincipalStatement(): this is PrincipalStatement {
    return this.statementObject.Principal !== undefined
  }

  public isNotPrincipalStatement(): this is NotPrincipalStatement {
    return this.statementObject.NotPrincipal !== undefined
  }

  public principals(): Principal[] {
    if (!this.isPrincipalStatement()) {
      throw new Error(
        'Called principals on a statement without Principal, use isPrincipalStatement before calling principals'
      )
    }
    return this.parsePrincipalObject(this.statementObject.Principal)
  }

  public principalTypeIsArray(principalType: string): boolean {
    if (!this.isPrincipalStatement()) {
      throw new Error(
        'Called principalTypeIsArray on a statement without Principal, use isPrincipalStatement before calling principalTypeIsArray'
      )
    }
    return (
      typeof this.statementObject.Principal === 'object' &&
      Array.isArray(this.statementObject.Principal[principalType])
    )
  }

  public hasSingleWildcardPrincipal(): boolean {
    if (!this.isPrincipalStatement()) {
      throw new Error(
        'Called hasSingleWildcardPrincipal on a statement without Principal, use isPrincipalStatement before calling hasSingleWildcardPrincipal'
      )
    }
    return this.statementObject.Principal === '*'
  }

  public notPrincipals(): Principal[] {
    if (!this.isNotPrincipalStatement()) {
      throw new Error(
        'Called notPrincipals on a statement without NotPrincipal, use isNotPrincipalStatement before calling notPrincipals'
      )
    }
    return this.parsePrincipalObject(this.statementObject.NotPrincipal)
  }

  public notPrincipalTypeIsArray(notPrincipalType: string): boolean {
    if (!this.isNotPrincipalStatement()) {
      throw new Error(
        'Called notPrincipalTypeIsArray on a statement without NotPrincipal, use isNotPrincipalStatement before calling notPrincipalTypeIsArray'
      )
    }
    return (
      typeof this.statementObject.NotPrincipal === 'object' &&
      Array.isArray(this.statementObject.NotPrincipal[notPrincipalType])
    )
  }

  public hasSingleWildcardNotPrincipal(): boolean {
    if (!this.isNotPrincipalStatement()) {
      throw new Error(
        'Called hasSingleWildcardNotPrincipal on a statement without NotPrincipal, use isNotPrincipalStatement before calling hasSingleWildcardNotPrincipal'
      )
    }
    return this.statementObject.NotPrincipal === '*'
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
    if (typeof principals === 'string') {
      return [new PrincipalImpl('AWS', principals)]
    }
    return Object.entries(principals)
      .map(([principalType, principalValue]) => {
        if (typeof principalValue === 'string') {
          return new PrincipalImpl(principalType as PrincipalType, principalValue)
        }
        return Object.entries(principalValue as any).map(([key, value]) => {
          return new PrincipalImpl(principalType as PrincipalType, value as string)
        })
      })
      .flat()
  }

  public isActionStatement(): this is ActionStatement {
    return this.statementObject.Action !== undefined
  }

  public isNotActionStatement(): this is NotActionStatement {
    return this.statementObject.NotAction !== undefined
  }

  public actions(): Action[] {
    if (!this.isActionStatement()) {
      throw new Error(
        'Called actions on a statement without Action, use isActionStatement before calling actions'
      )
    }
    return this.createNewActions()
  }

  private createNewActions(): Action[] {
    if (!this.actionIsArray()) {
      return [new ActionImpl(this.statementObject.Action, { path: `${this.path()}.Action` })]
    }
    return [this.statementObject.Action].flat().map((action: any, index) => {
      return new ActionImpl(action, { path: `${this.path()}.Action[${index}]` })
    })
  }

  public actionIsArray(): boolean {
    return Array.isArray(this.statementObject.Action)
  }

  public notActions(): Action[] {
    if (!this.isNotActionStatement()) {
      throw new Error(
        'Called notActions on a statement without NotAction, use isNotActionStatement before calling notActions'
      )
    }
    return this.createNewNotActions()
  }

  private createNewNotActions(): Action[] {
    if (!this.notActionIsArray()) {
      return [new ActionImpl(this.statementObject.NotAction, { path: `${this.path()}.NotAction` })]
    }
    return [this.statementObject.NotAction].flat().map((action: any, index) => {
      return new ActionImpl(action, { path: `${this.path()}.NotAction[${index}]` })
    })
  }

  public notActionIsArray(): boolean {
    return Array.isArray(this.statementObject.NotAction)
  }

  public isResourceStatement(): this is ResourceStatement {
    return this.statementObject.Resource !== undefined
  }

  public isNotResourceStatement(): this is NotResourceStatement {
    return this.statementObject.NotResource !== undefined
  }

  public resources(): Resource[] {
    if (!this.isResourceStatement()) {
      throw new Error(
        'Called resources on a statement without Resource, use isResourceStatement before calling resources'
      )
    }
    return this.createNewResources()
  }

  private createNewResources(): Resource[] {
    if (!this.resourceIsArray()) {
      return [new ResourceImpl(this.statementObject.Resource, { path: `${this.path()}.Resource` })]
    }

    return [this.statementObject.Resource].flat().map((resource: any, index) => {
      return new ResourceImpl(resource, { path: `${this.path()}.Resource[${index}]` })
    })
  }

  public hasSingleResourceWildcard(): boolean {
    if (!this.isResourceStatement()) {
      throw new Error(
        'Called hasSingleResourceWildcard on a statement without Resource, use isResourceStatement before calling hasSingleResourceWildcard'
      )
    }
    return this.statementObject.Resource === '*'
  }

  public resourceIsArray(): boolean {
    return Array.isArray(this.statementObject.Resource)
  }

  public notResources(): Resource[] {
    if (!this.isNotResourceStatement()) {
      throw new Error(
        'Called notResources on a statement without NotResource, use isNotResourceStatement before calling notResources'
      )
    }
    return this.createNewNotResources()
  }

  private createNewNotResources(): Resource[] {
    if (!this.notResourceIsArray()) {
      return [
        new ResourceImpl(this.statementObject.NotResource, { path: `${this.path()}.NotResource` })
      ]
    }

    return [this.statementObject.NotResource].flat().map((resource: any, index) => {
      return new ResourceImpl(resource, { path: `${this.path()}.NotResource[${index}]` })
    })
  }

  public notResourceIsArray(): boolean {
    return Array.isArray(this.statementObject.NotResource)
  }

  public hasSingleNotResourceWildcard(): boolean {
    if (!this.isNotResourceStatement()) {
      throw new Error(
        'Called hasSingleNotResourceWildcard on a statement without NotResource, use isNotResourceStatement before calling hasSingleNotResourceWildcard'
      )
    }
    return this.statementObject.NotResource === '*'
  }

  public conditionMap(): Record<string, Record<string, string[]>> | undefined {
    if (!this.statementObject.Condition) {
      return undefined
    }
    const result = {} as Record<string, Record<string, string[]>>
    for (const key of Object.keys(this.statementObject.Condition)) {
      const value = this.statementObject.Condition[key]
      result[key] = {}
      for (const subKey of Object.keys(value)) {
        const subValue = value[subKey]
        result[key][subKey] = Array.isArray(subValue) ? subValue : [subValue]
      }
    }
    return result
  }

  public conditions(): Condition[] {
    return this.createNewConditions()
  }

  private createNewConditions(): Condition[] {
    if (!this.statementObject.Condition) {
      return []
    }

    return Object.entries(this.statementObject.Condition)
      .map(([opKey, opValue]) => {
        return Object.entries(opValue as any).map(([condKey, condValue]) => {
          return new ConditionImpl(opKey, condKey, condValue as string | string[], {
            conditionPath: `${this.path()}.Condition`
          })
        })
      })
      .flat()
  }
}
