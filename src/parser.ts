import { type Policy, PolicyImpl } from './policies/policy.js'

/**
 * Load a Policy from a policy document
 *
 * @param policyDocument the policy document JSON object
 * @returns the Policy object for the backing policy document
 */
export function loadPolicy<T = undefined>(policyDocument: any, metadata?: T): Policy<T> {
  return new PolicyImpl(policyDocument, metadata)
}
