import { Annotated, Annotations, AnnotationStore } from '../annotations/annotations.js'
import { isAllWildcards } from '../utils.js'

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
  isWildcardAction(): this is WildcardAction

  /**
   * Whether the action is a service action: `"service:Action"`
   */
  isServiceAction(): this is ServiceAction
}

export interface AnnotatedAction extends Action, Annotated {}

/**
 * A wildcard action: `"*"`
 */
export interface WildcardAction extends Action {
  /**
   * The wildcard character `"*"`
   *
   * This mainly exists to differentiate between this interface and the Action interface
   */
  wildcardValue(): '*'
}

/**
 * A service action: `"service:Action"`
 */
export interface ServiceAction extends Action {
  /**
   * The service of the action
   *
   * Guaranteed to be lowercase
   */
  service(): string

  /**
   * The action within the service
   */
  action(): string
}

export class ActionImpl implements Action, AnnotatedAction, WildcardAction, ServiceAction {
  private readonly annotationStore: AnnotationStore
  constructor(private readonly rawValue: string) {
    this.annotationStore = new AnnotationStore()
  }

  public addAnnotation(key: string, value: string): void {
    this.annotationStore.addAnnotation(key, value)
  }

  public getAnnotations(): Annotations {
    return this.annotationStore
  }

  public type(): ActionType {
    if (isAllWildcards(this.rawValue)) {
      return 'wildcard'
    }
    return 'service'
  }

  public wildcardValue(): '*' {
    return '*'
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
    return this.rawValue.split(':')[0]!.toLowerCase()
  }

  public action(): string {
    return this.rawValue.split(':')[1]
  }
}
