import { AnnotatedPolicy, type Policy, PolicyImpl } from './policies/policy.js'

/**
 * Load a Policy from a policy document
 *
 * @param policyDocument the policy document JSON object
 * @returns the Policy object for the backing policy document
 */
export function loadPolicy(policyDocument: any): Policy {
  return new PolicyImpl(policyDocument, false)
}

export function loadAnnotatedPolicy(policyDocument: any): AnnotatedPolicy {
  return new PolicyImpl(policyDocument, true)
}
