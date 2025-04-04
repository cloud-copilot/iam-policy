import { isAllWildcards } from '../utils.js'

/**
 * A resource string in an IAM policy
 */
export interface Resource {
  /**
   * The raw string of the resource
   */
  value(): string

  /**
   * Whether the resource is all resources: `"*"`
   */
  isAllResources(): boolean

  /**
   * Whether the resource is an ARN resource
   */
  isArnResource(): this is ArnResource

  /**
   * The path to the resource in the policy document
   */
  path(): string
}

export interface ArnResource extends Resource {
  /**
   * The partition of the ARN
   */
  partition(): string

  /**
   * The service of the ARN
   */
  service(): string

  /**
   * The region of the ARN
   */
  region(): string

  /**
   * The account of the ARN
   */
  account(): string

  /**
   * The resource of the ARN
   */
  resource(): string
}

export class ResourceImpl implements Resource, ArnResource {
  constructor(
    private readonly rawValue: string,
    private readonly otherProps: {
      path: string
    }
  ) {}

  path(): string {
    return this.otherProps.path
  }

  partition(): string {
    if (!this.isArnResource()) {
      throw new Error(
        'Called partition on a resource without an ARN, use isArnResource before calling partition'
      )
    }
    return this.value().split(':').at(1)!
  }

  service(): string {
    if (!this.isArnResource()) {
      throw new Error(
        'Called service on a resource without an ARN, use isArnResource before calling service'
      )
    }
    return this.value().split(':').at(2)!
  }

  region(): string {
    if (!this.isArnResource()) {
      throw new Error(
        'Called region on a resource without an ARN, use isArnResource before calling region'
      )
    }
    return this.value().split(':').at(3)!
  }

  account(): string {
    if (!this.isArnResource()) {
      throw new Error(
        'Called account on a resource without an ARN, use isArnResource before calling account'
      )
    }
    return this.value().split(':').at(4)!
  }

  resource(): string {
    if (!this.isArnResource()) {
      throw new Error(
        'Called resource on a resource without an ARN, use isArnResource before calling resource'
      )
    }
    return this.value().split(':').slice(5).join(':')
  }

  value(): string {
    return this.rawValue
  }

  isAllResources(): boolean {
    return isAllWildcards(this.rawValue)
  }

  isArnResource(): this is ArnResource {
    return !this.isAllResources()
  }
}
