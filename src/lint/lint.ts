import {
  validatePolicySyntax,
  type ValidationCallbacks,
  type ValidationError
} from '../validate/validate.js'

/**
 * Lints an IAM policy document by running all syntax validation checks from
 * {@link validatePolicySyntax} plus additional best-practice checks that AWS
 * technically allows but that may indicate authoring mistakes.
 *
 * @param policyDocument - the raw policy document object to lint
 * @param validationCallbacks - optional callbacks to customize validation behavior per policy type
 * @returns an array of validation errors including both syntax errors and lint warnings
 */
export function lintPolicy(
  policyDocument: any,
  validationCallbacks: ValidationCallbacks = {}
): ValidationError[] {
  const allErrors = validatePolicySyntax(policyDocument, validationCallbacks)
  allErrors.push(...findDuplicateSids(policyDocument))
  return allErrors
}

/**
 * Finds duplicate Statement Ids (Sid) within a policy document.
 *
 * AWS allows duplicate Sids in resource policies, but they can indicate
 * copy-paste mistakes or authoring errors.
 *
 * @param policyDocument - the raw policy document object to check
 * @returns an array of validation errors, one for each statement that shares a duplicate Sid
 */
export function findDuplicateSids(policyDocument: any): ValidationError[] {
  if (typeof policyDocument !== 'object' || !Array.isArray(policyDocument?.Statement)) {
    return []
  }

  const statementIdCounts = policyDocument.Statement.reduce(
    (acc: Record<string, string[]>, statement: any, index: number) => {
      if (statement.Sid) {
        if (!acc[statement.Sid]) {
          acc[statement.Sid] = []
        }
        acc[statement.Sid].push(`Statement[${index}].Sid`)
      }
      return acc
    },
    {} as Record<string, string[]>
  )

  const errors: ValidationError[] = []
  for (const [, paths] of Object.entries<string[]>(statementIdCounts)) {
    if (paths.length > 1) {
      for (const path of paths) {
        errors.push({
          path,
          message: `Statement Ids (Sid) must be unique`
        })
      }
    }
  }
  return errors
}
