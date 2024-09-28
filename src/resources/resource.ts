import { isAllWildcards } from "../utils.js";

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
}


export class ResourceImpl implements Resource {
  constructor(private readonly rawValue: string) {}

  public value(): string {
    return this.rawValue;
  }

  public isAllResources(): boolean {
    return isAllWildcards(this.rawValue)
  }
}