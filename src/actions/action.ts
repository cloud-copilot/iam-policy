import { isAllWildcards } from "../utils.js"

export type ActionType = 'service' | 'wildcard'

/**
 * An Action string in an IAM policy
 */
export interface Action {
  /**
   * The type of actions
   */
  type(): ActionType

  /**
   * The raw string of the action
   */
  value(): string

  /**
   * Whether the action is a wildcard action: `"*"`
   */
  isWildcardAction(): boolean

  /**
   * Whether the action is a service action: `"service:Action"`
   */
  isServiceAction(): boolean
}

/**
 * A wildcard action: `"*"`
 */
export interface WildcardAction extends Action {
}

/**
 * A service action: `"service:Action"`
 */
export interface ServiceAction extends Action {
  /**
   * The service of the action
   */
  service(): string

  /**
   * The action within the service
   */
  action(): string
}

export class ActionImpl implements Action , WildcardAction, ServiceAction {
  constructor(private readonly rawValue: string) {}

  public type(): ActionType {
    if(isAllWildcards(this.rawValue)) {
      return 'wildcard'
    }
    return 'service'
  }

  public value(): string {
    return this.rawValue
  }

  public isWildcardAction(): this is WildcardAction {
    return this.type() === 'wildcard'
  }

  public isServiceAction(): this is ServiceAction {
    return this.type() === 'service'
  }

  public service(): string {
    return this.rawValue.split(':')[0]
  }

  public action(): string {
    return this.rawValue.split(':')[1]
  }
}