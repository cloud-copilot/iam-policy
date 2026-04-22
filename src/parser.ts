import { type Policy, PolicyImpl } from './policies/policy.js'
import { isValidatedPolicy } from './validatedPolicy.js'

/**
 * Load a Policy from a policy document. If a {@link ValidatedPolicy} is passed,
 * the raw document and metadata are extracted from it automatically. When both
 * the ValidatedPolicy carries metadata and the caller supplies explicit metadata,
 * the explicit metadata takes precedence.
 *
 * @param policyDocument the policy document JSON object, or a ValidatedPolicy
 * @param metadata optional metadata to attach to the loaded Policy
 * @returns the Policy object for the backing policy document
 */
export function loadPolicy<T = undefined>(policyDocument: any, metadata?: T): Policy<T> {
  if (isValidatedPolicy(policyDocument)) {
    return new PolicyImpl(policyDocument.policyDocument, metadata ?? policyDocument.metadata)
  }
  return new PolicyImpl(policyDocument, metadata)
}
