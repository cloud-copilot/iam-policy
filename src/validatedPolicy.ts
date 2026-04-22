import type { ValidationError } from './validate/validate.js'

/**
 * A policy document that has been validated. Carries the raw policy document,
 * optional metadata, and the validation result so that downstream consumers
 * can skip re-validation.
 *
 * Every field is a plain value — no class instances — so the entire object
 * survives JSON serialization (e.g. through SharedArrayBuffer) unchanged.
 */
export interface ValidatedPolicy<T = undefined> {
  /** Discriminant for runtime detection via {@link isValidatedPolicy}. */
  readonly __validated: true

  /** The raw policy JSON document. */
  readonly policyDocument: any

  /** Optional metadata carried through to {@link loadPolicy} (e.g. `{ name: string }` for error reporting). */
  readonly metadata?: T

  /** Validation errors. An empty array means the policy is valid. */
  readonly errors: readonly ValidationError[]
}

/**
 * Validates a policy document using the provided validation function and
 * bundles the result with the raw document and optional metadata.
 *
 * The caller chooses the validation function, so this factory is agnostic
 * to the policy type (identity, SCP, RCP, resource, trust, endpoint, etc.).
 *
 * @param policyDocument the raw policy JSON document
 * @param validateFn a validation function that returns an array of errors (empty if valid)
 * @param metadata optional metadata to carry with the validated policy
 * @returns a ValidatedPolicy containing the raw document, metadata, and validation errors
 */
export function createValidatedPolicy<T = undefined>(
  policyDocument: any,
  validateFn: (policy: any) => ValidationError[],
  metadata?: T
): ValidatedPolicy<T> {
  const errors = validateFn(policyDocument)
  return { __validated: true, policyDocument, metadata, errors }
}

/**
 * Type guard that checks whether a value is a {@link ValidatedPolicy}.
 *
 * @param value the value to check
 * @returns true if the value is a ValidatedPolicy
 */
export function isValidatedPolicy(value: any): value is ValidatedPolicy {
  return !!value && value.__validated === true
}
