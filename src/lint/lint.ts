import {
  validatePolicySyntax,
  type ValidationCallbacks,
  type ValidationError
} from '../validate/validate.js'
import { validateResourcePolicy } from '../validate/validateTypes.js'

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
  allErrors.push(...findEmptyActions(policyDocument))
  return allErrors
}

/**
 * Lints a resource policy document. Runs the resource-policy syntax validation
 * plus the generic lint rules and the resource-policy-specific check for
 * statements missing both `Principal` and `NotPrincipal`. AWS accepts such
 * statements syntactically, but they can never match a request.
 *
 * @param policyDocument - the raw resource policy document to lint
 * @returns an array of validation errors including syntax errors and lint warnings
 */
export function lintResourcePolicy(policyDocument: any): ValidationError[] {
  const errors = validateResourcePolicy(policyDocument)
  errors.push(...findDuplicateSids(policyDocument))
  errors.push(...findEmptyActions(policyDocument))
  errors.push(...findStatementsWithoutPrincipal(policyDocument))
  return errors
}

/**
 * Finds statements in a resource policy that have neither a `Principal` nor a
 * `NotPrincipal` element. AWS accepts these syntactically but they can never
 * match a request, which is almost always an authoring mistake.
 *
 * @param policyDocument - the raw resource policy document to check
 * @returns an array of validation errors, one for each statement missing both Principal and NotPrincipal
 */
function findStatementsWithoutPrincipal(policyDocument: any): ValidationError[] {
  if (typeof policyDocument !== 'object' || policyDocument === null) {
    return []
  }

  const rawStatements = policyDocument.Statement
  if (rawStatements === undefined) {
    return []
  }

  const statements = Array.isArray(rawStatements) ? rawStatements : [rawStatements]
  const isArray = Array.isArray(rawStatements)

  const errors: ValidationError[] = []
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (typeof statement !== 'object' || statement === null) {
      continue
    }
    if (statement.Principal === undefined && statement.NotPrincipal === undefined) {
      errors.push({
        path: isArray ? `Statement[${i}]` : 'Statement',
        message: 'One of Principal or NotPrincipal is required in a resource policy'
      })
    }
  }

  return errors
}

/**
 * Checks a single action string for issues with the action part after the
 * colon. Flags two cases:
 * - Empty or whitespace-only action (e.g. "s3:" or "s3:   ")
 * - Action containing whitespace (e.g. "s3:GetObject   " or "s3: GetObject")
 *
 * AWS technically allows these, but they almost always indicate authoring
 * mistakes.
 *
 * @param action - the raw action string value
 * @param path - the JSON-path location of this action in the policy document
 * @returns an array of validation errors for any issues found
 */
function lintActionString(action: string, path: string): ValidationError[] {
  if (typeof action !== 'string') {
    return []
  }
  const parts = action.split(':')
  if (parts.length !== 2) {
    return []
  }
  if (parts[1].trim().length === 0) {
    return [
      {
        path,
        message: 'Action is empty for the service'
      }
    ]
  }
  if (parts[1] !== parts[1].trim()) {
    return [
      {
        path,
        message: 'Action contains whitespace'
      }
    ]
  }
  return []
}

/**
 * Finds actions in a policy document that have the format "service:" — a
 * service prefix followed by a colon but no action name. AWS allows this
 * but it likely indicates an authoring mistake.
 *
 * @param policyDocument - the raw policy document object to check
 * @returns an array of validation errors, one for each action that has an empty action part
 */
export function findEmptyActions(policyDocument: any): ValidationError[] {
  if (typeof policyDocument !== 'object' || policyDocument === null) {
    return []
  }

  const statements = Array.isArray(policyDocument.Statement)
    ? policyDocument.Statement
    : policyDocument.Statement !== undefined
      ? [policyDocument.Statement]
      : []

  const errors: ValidationError[] = []
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (typeof statement !== 'object' || statement === null) {
      continue
    }
    const basePath = Array.isArray(policyDocument.Statement) ? `Statement[${i}]` : 'Statement'

    for (const field of ['Action', 'NotAction']) {
      const value = statement[field]
      if (value === undefined) {
        continue
      }
      const fieldPath = `${basePath}.${field}`
      if (typeof value === 'string') {
        errors.push(...lintActionString(value, fieldPath))
      } else if (Array.isArray(value)) {
        for (let j = 0; j < value.length; j++) {
          errors.push(...lintActionString(value[j], `${fieldPath}[${j}]`))
        }
      }
    }
  }

  return errors
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
