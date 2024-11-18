
export interface ValidationError {
  message: string
  path: string
}

const serviceRegex = /^[a-zA-Z0-9-]+$/
const actionRegex = /^[a-zA-Z0-9*\?]+$/

const allowedPolicyKeys = new Set([ 'Version', 'Statement', 'Id' ])
const allowedStatementKeys = new Set([ 'Sid', 'Effect', 'Action', 'NotAction', 'Resource', 'NotResource', 'Principal', 'NotPrincipal', 'Condition'])
const allowedPrincipalKeys = new Set([ 'AWS', 'Service', 'Federated', 'CanonicalUser'])
const validConditionOperatorPattern = /^[a-zA-Z0-9:]+$/
const allowedSetOperators = new Set(["forallvalues", "foranyvalue"])
type PolicyDataType = 'string' | 'object'

export interface ValidationCallbacks {
  validateStatement?: (statement: any, path: string) => ValidationError[]
  validateAction?: (action: string, path: string) => ValidationError[]
  validateNotAction?: (notAction: string, path: string) => ValidationError[]
  validatePrincipal?: (principal: any, path: string) => ValidationError[]
  validateNotPrincipal?: (notPrincipal: any, path: string) => ValidationError[]
  validateResource?: (resource: string, path: string) => ValidationError[]
  validateNotResource?: (notResource: string, path: string) => ValidationError[]
}

export function validatePolicySyntax(policyDocument: any, validationCallbacks: ValidationCallbacks = {}): ValidationError[] {
  const allErrors: ValidationError[] = []
  if(typeof policyDocument !== 'object') {
    return [{path: '', message: `Policy must be an object, received type ${typeof policyDocument}`}]
  } else if (Array.isArray(policyDocument)) {
    return [{path: '', message: 'Policy must be an object, received an array'}]
  }

  allErrors.push(...validateKeys(policyDocument, allowedPolicyKeys, ''))
  allErrors.push(...validatePolicyVersion(policyDocument.Version))

  allErrors.push(...validateDataTypeIfExists(policyDocument.Id, 'Id', 'string'))
  if(!policyDocument.Statement) {
    allErrors.push({
      path: 'Statement',
      message: 'Statement is required',
    })
  }
  allErrors.push(...validateTypeOrArrayOfTypeIfExists(policyDocument.Statement, 'Statement', ['object']))
  if(typeof policyDocument.Statement === 'object' && !Array.isArray(policyDocument.Statement)) {
    allErrors.push(...validateStatement(policyDocument.Statement, 'Statement', validationCallbacks))
  } else if (Array.isArray(policyDocument.Statement)) {
    for(let i = 0; i < policyDocument.Statement.length; i++) {
      allErrors.push(...validateStatement(policyDocument.Statement[i], `Statement[${i}]`, validationCallbacks))
    }
    const statementIdCounts = policyDocument.Statement.reduce((acc: Record<string, number>, statement: any) => {
      if(statement.Sid) {
        acc[statement.Sid] = acc[statement.Sid] ? acc[statement.Sid] + 1 : 1
      }
      return acc
    }, {} as Record<string, number>)
    for(const [sid, count] of Object.entries<number>(statementIdCounts)) {
      if(count > 1) {
        allErrors.push({
          path: `Statement`,
          message: `Statement Ids must be unique, found ${sid} ${count} times`
        })
      }
    }
  }

  return allErrors
}

function validatePolicyVersion(version: any): ValidationError[] {
  if(version === undefined || version === null) {
    return []
  }
  if(typeof version !== 'string') {
    return [
      {
        path: 'Version',
        message: `Version must be a string if present`
      }
    ]
  }

  if(version === '2012-10-17' || version === '2008-10-17') {
    return []
  }

  return [
    {
      path: 'Version',
      message: `Version must be either "2012-10-17" or "2008-10-17"`
    }
  ]


}

function validateStatement(statement: any, path: string, validationCallbacks: ValidationCallbacks): ValidationError[] {
  const statementErrors: ValidationError[] = []
  statementErrors.push(...validateKeys(statement, allowedStatementKeys, path))
  statementErrors.push(...validateDataTypeIfExists(statement.Sid, `${path}.Sid`, 'string'))
  if(statement.Effect !== 'Allow' && statement.Effect !== 'Deny') {
    statementErrors.push({path: `${path}.Effect`, message: `Effect must be present and exactly "Allow" or "Deny"`})
  }
  statementErrors.push(...validationCallbacks.validateStatement?.(statement, path) || [])

  statementErrors.push(...validateOnlyOneOf(statement, path, 'Action', 'NotAction'))
  statementErrors.push(...validateOnlyOneOf(statement, path, 'Resource', 'NotResource'))
  statementErrors.push(...validateOnlyOneOf(statement, path, 'Principal', 'NotPrincipal'))

  statementErrors.push(...validateTypeOrArrayOfTypeIfExists(statement.Action, `${path}.Action`, 'string'))
  statementErrors.push(...validateTypeOrArrayOfTypeIfExists(statement.NotAction, `${path}.NotAction`, 'string'))

  statementErrors.push(...validateActionIfPresent(statement.Action, `${path}.Action`))
  statementErrors.push(...validateActionIfPresent(statement.NotAction, `${path}.NotAction`))

  statementErrors.push(...validateStringOrArrayStringCallback(statement, 'Action', path, validationCallbacks.validateAction))
  statementErrors.push(...validateStringOrArrayStringCallback(statement, 'NotAction', path, validationCallbacks.validateNotAction))

  statementErrors.push(...validateResource(statement.Resource, `${path}.Resource`))
  statementErrors.push(...validateResource(statement.NotResource, `${path}.NotResource`))

  statementErrors.push(...validateDataTypeIfExists(statement.Principal, `${path}.Principal`, ['string', 'object']))
  statementErrors.push(...validateDataTypeIfExists(statement.NotPrincipal, `${path}.NotPrincipal`, ['string', 'object']))
  statementErrors.push(...validatePrincipal(statement.Principal, `${path}.Principal`))
  statementErrors.push(...validatePrincipal(statement.NotPrincipal, `${path}.NotPrincipal`))

  //TODO: If the condition key exists but there is no value, it is an error
  statementErrors.push(...validateCondition(statement.Condition, `${path}.Condition`))
  return statementErrors

}

function validatePrincipal(principal: any, path: string): ValidationError[] {
  const principalErrors: ValidationError[] = []

  if(principal === undefined || typeof principal === 'string') {
    return []
  }
  if(typeof principal === 'object') {
    principalErrors.push(...validateKeys(principal, allowedPrincipalKeys, path))
    principalErrors.push(...validateTypeOrArrayOfTypeIfExists(principal.AWS, `${path}.AWS`, 'string'))
    principalErrors.push(...validateTypeOrArrayOfTypeIfExists(principal.Service, `${path}.Service`, 'string'))
    principalErrors.push(...validateTypeOrArrayOfTypeIfExists(principal.Federated, `${path}.Federated`, 'string'))
    principalErrors.push(...validateTypeOrArrayOfTypeIfExists(principal.CanonicalUser, `${path}.CanonicalUser`, 'string'))
  }

  return principalErrors

}

function validateResource(resource: any, path: string): ValidationError[] {
  if(resource === undefined) {
    return []
  }
  if(typeof resource === 'string') {
    return validateResourceString(resource, path)
  } else if (Array.isArray(resource)) {
    const resourceErrors: ValidationError[] = []
    for(let i = 0; i < resource.length; i++) {
      resourceErrors.push(...validateResourceString(resource[i], `${path}[${i}]`))
    }
    return resourceErrors
  }
  return [
    {
      path,
      message: `Must be a string or array of strings`
    }
  ]
}

function validateResourceString(resourceString: any, path: string): ValidationError[] {
  if(resourceString === "*") {
    return []
  }
  const parts = resourceString.split(':')
  if(parts.length < 6 || parts.at(0) != 'arn') {
    return [
      {
        path,
        message: `Resource arn must have 6 segments and start with "arn:"`
      }
    ]
  }

  return []

}

function validateActionIfPresent(action: any, path: string): ValidationError[] {
  if(action === undefined || action === null) {
    return []
  }
  //Type errors are caught elsewhere
  if(typeof action === 'string') {
    return validateActionString(action, path)
  } else if (Array.isArray(action)) {
    const actionErrors: ValidationError[] = []
    for(let i = 0; i < action.length; i++) {
      const value = action[i]
      if(typeof value === 'string') {
        actionErrors.push(...validateActionString(action[i], `${path}[${i}]`))
      }

    }
    return actionErrors
  }
  return []
}

function validateActionString(string: string, path: string): ValidationError[] {
  if(string === '*') {
    return []
  }
  const parts = string.split(':')
  if(parts.length != 2) {
    return [
      {
        path,
        message: `Action must be a wildcard (*) or have 2 segments`
      }
    ]
  }

  const [ service, action ] = parts
  const errors: ValidationError[] = []
  if(!serviceRegex.test(service)) {
    errors.push({
      path,
      message: `Service can only contain letters, numbers, and hyphens`
    })
  }
  if(!actionRegex.test(action)) {
    errors.push({
      path,
      message: `Action can only contain letters, numbers, asterisks, and question marks`
    })
  }

  return errors
}

function validateCondition(condition: any, path: string): ValidationError[] {
  const conditionErrors: ValidationError[] = []
  if(condition === undefined || condition === null) {
    return []
  }
  conditionErrors.push(...validateDataTypeIfExists(condition, path, 'object'))
  if(typeof condition !== 'object') {
    return conditionErrors
  } else if (Array.isArray(condition)) {
    conditionErrors.push({
      message: 'Condition must be an object, found an array',
      path
    })
    return conditionErrors
  }

  const conditionOperators = Object.keys(condition)
  for(const operator of conditionOperators) {
    //If not valid pattern
    if(!validConditionOperatorPattern.test(operator)) {
      conditionErrors.push({
        path: `${path}.${operator}`,
        message: `Condition operator is invalid`,
      })
    }
    const splitOperator = operator.split(':')
    if(splitOperator.length > 2) {
      conditionErrors.push({
        path: `${path}.${operator}`,
        message: `Condition operator is invalid`,
      })
    } else if (splitOperator.length === 2) {
      const setOperator = splitOperator[0].toLowerCase()
      if(!allowedSetOperators.has(setOperator)) {
        conditionErrors.push({
          path: `${path}.${operator}`,
          message: `Condition set operator must be either ForAllValues or ForAnyValue`,
        })
      }
    }

    conditionErrors.push(...validateDataTypeIfExists(condition[operator], `${path}.${operator}`, 'object'))
    if(Array.isArray(condition[operator])) {
      conditionErrors.push({
        message: 'Condition operator must be an object, found an array',
        path: `${path}.${operator}`
      })
    }

    if(typeof condition[operator] === 'object' && !Array.isArray(condition[operator])) {
      const conditionKeys = Object.keys(condition[operator])
      for(const key of conditionKeys) {
        conditionErrors.push(...validateTypeOrArrayOfTypeIfExists(condition[operator][key], `${path}.${operator}.${key}`, 'string'))
      }
    }
  }

  return conditionErrors
}

function validateKeys(object: any, allowedKeys: Set<string>, path: string): ValidationError[] {
  const keyErrors: ValidationError[] = []
  if(path != '') {
    path = `${path}.`
  }

  for(const key of Object.keys(object)) {
    if(!allowedKeys.has(key)) {
      keyErrors.push({
        message: `Invalid key ${key}`,
        path: `${path}${key}`
      })
    } else if (object[key] === undefined || object[key] === null) {
      keyErrors.push({
        message: `If present, ${key} cannot be null or undefined`,
        path: `${path}${key}`
      })
    }
  }
  return keyErrors
}

function validateTypeOrArrayOfTypeIfExists(value: any, path: string, allowedTypes: PolicyDataType|PolicyDataType[]): ValidationError[] {
  if(value === undefined) {
    return []
  }

  allowedTypes = Array.isArray(allowedTypes) ? allowedTypes : [ allowedTypes ]
  const arrayOfTypeErrors: ValidationError[] = []
  if(!Array.isArray(value)) {
    return validateDataTypeIfExists(value, path, allowedTypes)
  } else {
    for(let i = 0; i < value.length; i++) {
      arrayOfTypeErrors.push(...validateDataTypeIfExists(value[i], `${path}[${i}]`, allowedTypes))
    }
  }

  return arrayOfTypeErrors
}

function validateDataTypeIfExists(value: any, path: string, allowedDataTypes: PolicyDataType|PolicyDataType[]): ValidationError[] {
  if(value === undefined) {
    return []
  }

  allowedDataTypes = Array.isArray(allowedDataTypes) ? allowedDataTypes : [ allowedDataTypes ]
  const errors: ValidationError[] = []
  const foundDataType = typeof value
  if(!allowedDataTypes.includes(foundDataType as PolicyDataType)) {
    errors.push({
      message: `Found data type ${foundDataType} allowed type(s) are ${allowedDataTypes.join(', ')}`,
      path
    })
  }
  return errors
}

function validateOnlyOneOf(value: any, path: string, firstKey: string, secondKey: string): ValidationError[] {
  const keys = Object.keys(value)
  if(keys.includes(firstKey) && keys.includes(secondKey)) {
    return [
      {
        message: `Only one of ${firstKey} or ${secondKey} is allowed, found both`,
        path
      }
    ]
  }

  return []
}

function validateStringOrArrayStringCallback(statement: any, fieldName: string, path: string, callback?: (value: string, path: string) => ValidationError[]): ValidationError[] {
  if(statement === undefined || !statement[fieldName] || !callback) {
    return []
  }
  const value = statement[fieldName]
  path = `${path}.${fieldName}`
  if(typeof value === 'string') {
    return callback(value, path)
  } else if (Array.isArray(value)) {
    const errors: ValidationError[] = []
    for(let i = 0; i < value.length; i++) {
      errors.push(...callback(value[i], `${path}[${i}]`))
    }
    return errors
  }
  //If it's not a string or string array that is caught elsewhere
  return []
}