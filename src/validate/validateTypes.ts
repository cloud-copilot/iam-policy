import { validatePolicySyntax, ValidationError } from './validate.js'

/**
 * Validates an Identity Policy attached to an IAM role or user, or managed policy
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateIdentityPolicy(policy: any): ValidationError[] {
  return validatePolicySyntax(policy, {
    validateStatement: (statement, path) => {
      const policyType = 'an identity policy statement'
      const errors: ValidationError[] = []
      errors.push(
        ...validateProhibitedFields(statement, ['Principal', 'NotPrincipal'], path, policyType)
      )
      errors.push(...validateAtLeastOneOf(statement, ['Action', 'NotAction'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Resource', 'NotResource'], path, policyType))
      return errors
    }
  })
}

/**
 * Validates a Service Control Policy (SCP)
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateServiceControlPolicy(policy: any): ValidationError[] {
  const policyType = 'a service control policy'

  return validatePolicySyntax(policy, {
    validateStatement: (statement, path) => {
      const errors: ValidationError[] = []
      errors.push(
        ...validateProhibitedFields(statement, ['Principal', 'NotPrincipal'], path, policyType)
      )
      errors.push(...validateAtLeastOneOf(statement, ['Action', 'NotAction'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Resource', 'NotResource'], path, policyType))

      return errors
    }
  })
}

/**
 * Validates a Resource Policy attached to an S3 bucket, SQS queue, or other resource. \
 *
 * This is very generic and will not be able to validate all resource policies.
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateResourcePolicy(policy: any): ValidationError[] {
  return validatePolicySyntax(policy, {
    validateStatement: (statement, path) => {
      const policyType = 'a resource policy'
      const errors: ValidationError[] = []
      errors.push(...validateAtLeastOneOf(statement, ['Action', 'NotAction'], path, policyType))
      errors.push(
        ...validateAtLeastOneOf(statement, ['Principal', 'NotPrincipal'], path, policyType)
      )
      return errors
    }
  })
}

/**
 * Validates a Resource Control Policy (RCP)
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateResourceControlPolicy(policy: any): ValidationError[] {
  const policyType = 'a resource control policy'

  return validatePolicySyntax(policy, {
    validateVersion: (version, path) => {
      if (version !== '2012-10-17') {
        return [
          {
            path: version === undefined ? path : `Version`,
            message: `Version must be "2012-10-17" in ${policyType}`
          }
        ]
      }
      return []
    },
    validateStatement: (statement, path) => {
      const errors: ValidationError[] = []

      if (statement.Effect !== 'Deny') {
        errors.push({
          path: `${path}.Effect`,
          message: `Effect must be "Deny" in ${policyType}`
        })
      }

      if (statement.Principal !== '*') {
        errors.push({
          path: statement.Principal == undefined ? path : `${path}.Principal`,
          message: `Principal must be "*" in ${policyType}`
        })
      }

      errors.push(
        ...validateProhibitedFields(statement, ['NotPrincipal', 'NotAction'], path, policyType)
      )
      errors.push(...validateAtLeastOneOf(statement, ['Action'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Resource', 'NotResource'], path, policyType))
      return errors
    },

    validateAction: (action, path) => {
      if (action === '*') {
        return [
          {
            path,
            message: `Action cannot be "*" in ${policyType}`
          }
        ]
      }
      return []
    }
  })
}

/**
 * Validates a Trust Policy attached to a role
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateTrustPolicy(policy: any): ValidationError[] {
  return validatePolicySyntax(policy, {
    validateStatement: (statement, path) => {
      const policyType = 'a trust policy'
      const errors: ValidationError[] = []
      errors.push(
        ...validateProhibitedFields(statement, ['Resource', 'NotResource'], path, policyType)
      )
      errors.push(...validateAtLeastOneOf(statement, ['Action', 'NotAction'], path, policyType))
      errors.push(
        ...validateAtLeastOneOf(statement, ['Principal', 'NotPrincipal'], path, policyType)
      )
      return errors
    }
  })
}

/**
 * Validates an VPC Endpoint Policy
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateEndpointPolicy(policy: any): ValidationError[] {
  return validatePolicySyntax(policy, {
    validateStatement: (statement, path) => {
      const policyType = 'an endpoint policy'
      const errors: ValidationError[] = []
      errors.push(...validateProhibitedFields(statement, ['NotPrincipal'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Action', 'NotAction'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Resource', 'NotResource'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Principal'], path, policyType))
      if (statement.Principal && statement.Principal !== '*') {
        errors.push({
          message: `Principal must be "*" in ${policyType}`,
          path: `${path}.Principal`
        })
      }
      return errors
    }
  })
}

/**
 * Validates a session policy
 *
 * @param policy the policy to validate
 * @returns an array of validation errors
 */
export function validateSessionPolicy(policy: any): ValidationError[] {
  return validatePolicySyntax(policy, {
    validateStatement: (statement, path) => {
      const policyType = 'a session policy'
      const errors: ValidationError[] = []
      errors.push(
        ...validateProhibitedFields(statement, ['Principal', 'NotPrincipal'], path, policyType)
      )
      errors.push(...validateAtLeastOneOf(statement, ['Action', 'NotAction'], path, policyType))
      errors.push(...validateAtLeastOneOf(statement, ['Resource', 'NotResource'], path, policyType))
      return errors
    }
  })
}

/**
 * Validates that at least one of the specified fields is present in a statement
 *
 * @param statement the statement to validate
 * @param requiredFields the list of fields, that at least one must be present
 * @param path the path to the statement in the policy
 * @param policyType the type of policy being validated
 * @returns an array of validation errors
 */
function validateAtLeastOneOf(
  statement: any,
  requiredFields: string[],
  path: string,
  policyType: string
): ValidationError[] {
  const presentFields = requiredFields.filter((field) => statement[field])
  let message = `One of ${requiredFields.join(' or ')} is required in ${policyType}`
  if (requiredFields.length === 1) {
    message = `${requiredFields[0]} is required in ${policyType}`
  }

  if (presentFields.length === 0) {
    return [
      {
        path,
        message
      }
    ]
  }
  return []
}

/**
 * Validates prohibited fields do not exist in a statement
 *
 * @param statement the statement to validate
 * @param prohibitedFields the list of fields that are not allowed
 * @param path the path to the statement in the policy
 * @param policyType the type of policy being validated
 * @returns an array of validation errors
 */
function validateProhibitedFields(
  statement: any,
  prohibitedFields: string[],
  path: string,
  policyType: string
): ValidationError[] {
  const errors: ValidationError[] = []
  for (const field of prohibitedFields) {
    if (statement[field]) {
      errors.push({
        path: `${path}.#${field}`,
        message: `${field} is not allowed in ${policyType}`
      })
    }
  }
  return errors
}
