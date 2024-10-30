export interface ValidationError {
  message: string
  path: string
}

const allowedPolicyKeys = new Set([ 'Version', 'Statement', 'Id' ])
const allowedStatementKeys = new Set([ 'Sid', 'Effect', 'Action', 'NotAction', 'Resource', 'NotResource', 'Principal', 'NotPrincipal', 'Condition'])
const allowedPrincipalKeys = new Set([ 'AWS', 'Service', 'Federated', 'CanonicalUser'])
type PolicyDataType = 'string' | 'object'

export function validatePolicySyntax(policyDocument: any): ValidationError[] {
  const allErrors: ValidationError[] = []
  if(typeof policyDocument !== 'object') {
    return [{path: '', message: `Policy must be an object, received type ${typeof policyDocument}`}]
  } else if (Array.isArray(policyDocument)) {
    return [{path: '', message: 'Policy must be an object, received an array'}]
  }

  allErrors.push(...validateKeys(policyDocument, allowedPolicyKeys, ''))

  allErrors.push(...validateDataTypeIfExists(policyDocument.Version, 'Version', 'string'))
  allErrors.push(...validateDataTypeIfExists(policyDocument.Id, 'Id', 'string'))
  if(!policyDocument.Statement) {
    allErrors.push({
      path: 'Statement',
      message: 'Statement is required',
    })
  }
  allErrors.push(...validateTypeOrArrayOfTypeIfExists(policyDocument.Statement, 'Statement', ['object']))
  if(typeof policyDocument.Statement === 'object' && !Array.isArray(policyDocument.Statement)) {
    allErrors.push(...validateStatement(policyDocument.Statement, 'Statement'))
  } else if (Array.isArray(policyDocument.Statement)) {
    for(let i = 0; i < policyDocument.Statement.length; i++) {
      allErrors.push(...validateStatement(policyDocument.Statement[i], `Statement[${i}]`))
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

function validateStatement(statement: any, path: string): ValidationError[] {
  const statementErrors: ValidationError[] = []
  statementErrors.push(...validateKeys(statement, allowedStatementKeys, path))
  statementErrors.push(...validateDataTypeIfExists(statement.Sid, `${path}.Sid`, 'string'))
  if(statement.Effect !== 'Allow' && statement.Effect !== 'Deny') {
    statementErrors.push({path: `${path}.Effect`, message: `Effect must be present and exactly "Allow" or "Deny"`})
  }

  statementErrors.push(...validateOnlyOneOf(statement, path, 'Action', 'NotAction'))
  statementErrors.push(...validateOnlyOneOf(statement, path, 'Resource', 'NotResource'))
  statementErrors.push(...validateOnlyOneOf(statement, path, 'Principal', 'NotPrincipal'))

  statementErrors.push(...validateTypeOrArrayOfTypeIfExists(statement.Action, `${path}.Action`, 'string'))
  statementErrors.push(...validateTypeOrArrayOfTypeIfExists(statement.NotAction, `${path}.NotAction`, 'string'))

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