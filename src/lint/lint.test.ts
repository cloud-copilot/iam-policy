import { describe, expect, it } from 'vitest'
import { sortErrors } from '../validate/testutil.js'
import { findDuplicateSids, findEmptyActions, lintPolicy, lintResourcePolicy } from './lint.js'

describe('lintPolicy', () => {
  it('should return no errors for a valid policy with unique Sids', () => {
    //Given a policy with unique Sids
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowGetObject',
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        },
        {
          Sid: 'AllowPutObject',
          Effect: 'Allow',
          Action: 's3:PutObject',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        }
      ]
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return duplicate Sid errors for a policy with duplicate Sids', () => {
    //Given a policy with duplicate Sids
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowGetObject',
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        },
        {
          Sid: 'AllowGetObject',
          Effect: 'Allow',
          Action: 's3:PutObject',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        }
      ]
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then duplicate Sid errors should be returned
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        { path: 'Statement[0].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should return both syntax errors and duplicate Sid errors', () => {
    //Given a policy with both syntax errors and duplicate Sids
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'DuplicateSid',
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        },
        {
          Sid: 'DuplicateSid',
          Effect: 'InvalidEffect',
          Action: 's3:PutObject',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        }
      ]
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then both syntax and lint errors should be returned
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        {
          path: 'Statement[1].Effect',
          message: 'Effect must be present and exactly "Allow" or "Deny"'
        },
        { path: 'Statement[0].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should pass through validation callbacks', () => {
    //Given a policy with a validation callback that rejects Principal
    const policy = {
      Version: '2012-10-17',
      Statement: {
        Effect: 'Allow',
        Action: 's3:GetObject',
        Resource: 'arn:aws:s3:::my_corporate_bucket',
        Principal: '*'
      }
    }

    //When the policy is linted with a callback that prohibits Principal
    const errors = lintPolicy(policy, {
      validateStatement: (statement, path) => {
        if (statement.Principal) {
          return [{ path: `${path}.Principal`, message: 'Principal is not allowed' }]
        }
        return []
      }
    })

    //Then the callback error should be returned
    expect(errors).toEqual([{ path: 'Statement.Principal', message: 'Principal is not allowed' }])
  })

  it('should return empty action lint error for a whitespace-only action', () => {
    //Given a policy with a whitespace-only action after the colon
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:      ',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        }
      ]
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then an empty action lint error should be returned
    expect(errors).toEqual([
      { path: 'Statement[0].Action', message: 'Action is empty for the service' }
    ])
  })

  it('should return empty action lint error for a trailing colon action', () => {
    //Given a policy with a trailing colon action
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        }
      ]
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then an empty action lint error should be returned
    expect(errors).toEqual([
      { path: 'Statement[0].Action', message: 'Action is empty for the service' }
    ])
  })

  it('should return whitespace lint error for an action with trailing whitespace', () => {
    //Given a policy with an action that has trailing whitespace
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:ListAllMyBuckets     ',
          Resource: 'arn:aws:s3:::my_corporate_bucket'
        }
      ]
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then a whitespace lint error should be returned
    expect(errors).toEqual([{ path: 'Statement[0].Action', message: 'Action contains whitespace' }])
  })

  it('should return no errors for a single statement with no array', () => {
    //Given a policy with a single statement object (not an array)
    const policy = {
      Version: '2012-10-17',
      Statement: {
        Sid: 'AllowGetObject',
        Effect: 'Allow',
        Action: 's3:GetObject',
        Resource: 'arn:aws:s3:::my_corporate_bucket'
      }
    }

    //When the policy is linted
    const errors = lintPolicy(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })
})

describe('findDuplicateSids', () => {
  it('should return empty array for a non-object policy', () => {
    //Given a non-object policy
    const policy = 'not an object'

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return empty array when Statement is not an array', () => {
    //Given a policy with a single statement object
    const policy = {
      Statement: {
        Sid: 'AllowGetObject',
        Effect: 'Allow',
        Action: 's3:GetObject',
        Resource: 'arn:aws:s3:::my_corporate_bucket'
      }
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return empty array when no Sids are present', () => {
    //Given a policy with statements that have no Sids
    const policy = {
      Statement: [
        { Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }
      ]
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return empty array when all Sids are unique', () => {
    //Given a policy with unique Sids
    const policy = {
      Statement: [
        { Sid: 'First', Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Sid: 'Second', Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }
      ]
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should detect two statements with the same Sid', () => {
    //Given a policy with two statements sharing the same Sid
    const policy = {
      Statement: [
        { Sid: 'AllowGetObject', Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Sid: 'AllowGetObject', Effect: 'Allow', Action: 's3:PutObject', Resource: '*' }
      ]
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then errors should be returned for both statements
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        { path: 'Statement[0].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should detect three statements with the same Sid', () => {
    //Given a policy with three statements sharing the same Sid
    const policy = {
      Statement: [
        { Sid: 'Duplicate', Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Sid: 'Duplicate', Effect: 'Allow', Action: 's3:PutObject', Resource: '*' },
        { Sid: 'Duplicate', Effect: 'Deny', Action: 's3:DeleteObject', Resource: '*' }
      ]
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then errors should be returned for all three statements
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        { path: 'Statement[0].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[2].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should detect multiple groups of duplicate Sids', () => {
    //Given a policy with two different groups of duplicate Sids
    const policy = {
      Statement: [
        { Sid: 'GroupA', Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Sid: 'GroupB', Effect: 'Allow', Action: 's3:PutObject', Resource: '*' },
        { Sid: 'GroupA', Effect: 'Deny', Action: 's3:DeleteObject', Resource: '*' },
        { Sid: 'GroupB', Effect: 'Deny', Action: 's3:ListBucket', Resource: '*' }
      ]
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then errors should be returned for all duplicate statements
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        { path: 'Statement[0].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[2].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[3].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should only flag duplicates and not unique Sids', () => {
    //Given a policy with a mix of unique and duplicate Sids
    const policy = {
      Statement: [
        { Sid: 'Unique', Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Sid: 'Duplicate', Effect: 'Allow', Action: 's3:PutObject', Resource: '*' },
        { Sid: 'Duplicate', Effect: 'Deny', Action: 's3:DeleteObject', Resource: '*' }
      ]
    }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then only the duplicate Sid errors should be returned
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[2].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should return empty array when policy has no Statement property', () => {
    //Given a policy with no Statement
    const policy = { Version: '2012-10-17' }

    //When we check for duplicate Sids
    const errors = findDuplicateSids(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })
})

describe('findEmptyActions', () => {
  it('should return empty array for a non-object policy', () => {
    //Given a non-object policy
    const policy = 'not an object'

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return empty array when there are no empty actions', () => {
    //Given a policy with normal actions
    const policy = {
      Statement: [
        { Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Effect: 'Allow', Action: 's3:*', Resource: '*' }
      ]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return empty array for a wildcard action', () => {
    //Given a policy with a wildcard action
    const policy = {
      Statement: [{ Effect: 'Allow', Action: '*', Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should detect a trailing colon action string', () => {
    //Given a policy with a trailing colon action
    const policy = {
      Statement: [{ Effect: 'Allow', Action: 's3:', Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the empty action
    expect(errors).toEqual([
      { path: 'Statement[0].Action', message: 'Action is empty for the service' }
    ])
  })

  it('should detect a whitespace-only action string', () => {
    //Given a policy with a whitespace-only action after the colon
    const policy = {
      Statement: [{ Effect: 'Allow', Action: 's3:      ', Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the empty action
    expect(errors).toEqual([
      { path: 'Statement[0].Action', message: 'Action is empty for the service' }
    ])
  })

  it('should detect a whitespace-only action in an array', () => {
    //Given a policy with a whitespace-only action in an array
    const policy = {
      Statement: [{ Effect: 'Allow', Action: ['s3:GetObject', 'ec2:   '], Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the whitespace-only action at the correct index
    expect(errors).toEqual([
      { path: 'Statement[0].Action[1]', message: 'Action is empty for the service' }
    ])
  })

  it('should detect a trailing colon in an action array', () => {
    //Given a policy with a trailing colon action in an array
    const policy = {
      Statement: [{ Effect: 'Allow', Action: ['s3:GetObject', 'ec2:'], Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the empty action at the correct index
    expect(errors).toEqual([
      { path: 'Statement[0].Action[1]', message: 'Action is empty for the service' }
    ])
  })

  it('should detect an action with trailing whitespace', () => {
    //Given a policy with an action that has trailing whitespace
    const policy = {
      Statement: [{ Effect: 'Allow', Action: 's3:ListAllMyBuckets     ', Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the whitespace in the action
    expect(errors).toEqual([{ path: 'Statement[0].Action', message: 'Action contains whitespace' }])
  })

  it('should detect an action with leading whitespace', () => {
    //Given a policy with an action that has leading whitespace
    const policy = {
      Statement: [{ Effect: 'Allow', Action: 's3:  GetObject', Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the whitespace in the action
    expect(errors).toEqual([{ path: 'Statement[0].Action', message: 'Action contains whitespace' }])
  })

  it('should detect actions with whitespace in an array', () => {
    //Given a policy with actions containing whitespace in an array
    const policy = {
      Statement: [
        { Effect: 'Allow', Action: ['s3:GetObject', 'ec2:DescribeInstances   '], Resource: '*' }
      ]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the action with whitespace
    expect(errors).toEqual([
      { path: 'Statement[0].Action[1]', message: 'Action contains whitespace' }
    ])
  })

  it('should detect a trailing colon in NotAction', () => {
    //Given a policy with a trailing colon NotAction
    const policy = {
      Statement: [{ Effect: 'Deny', NotAction: 's3:', Resource: '*' }]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned for the empty NotAction
    expect(errors).toEqual([
      { path: 'Statement[0].NotAction', message: 'Action is empty for the service' }
    ])
  })

  it('should detect trailing colons across multiple statements', () => {
    //Given a policy with trailing colons in multiple statements
    const policy = {
      Statement: [
        { Effect: 'Allow', Action: 's3:', Resource: '*' },
        { Effect: 'Allow', Action: 's3:GetObject', Resource: '*' },
        { Effect: 'Deny', NotAction: 'ec2:', Resource: '*' }
      ]
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then errors should be returned for both empty actions
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        { path: 'Statement[0].Action', message: 'Action is empty for the service' },
        { path: 'Statement[2].NotAction', message: 'Action is empty for the service' }
      ])
    )
  })

  it('should handle a single statement object (not array)', () => {
    //Given a policy with a single statement as an object
    const policy = {
      Statement: { Effect: 'Allow', Action: 's3:', Resource: '*' }
    }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then an error should be returned with the correct path
    expect(errors).toEqual([
      { path: 'Statement.Action', message: 'Action is empty for the service' }
    ])
  })

  it('should return empty array when policy has no Statement property', () => {
    //Given a policy with no Statement
    const policy = { Version: '2012-10-17' }

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return empty array for null policy', () => {
    //Given a null policy
    const policy = null

    //When we check for empty actions
    const errors = findEmptyActions(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })
})

describe('lintResourcePolicy', () => {
  it('should return no errors for a valid resource policy with Principal', () => {
    //Given a valid resource policy with a Principal
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowGet',
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*',
          Principal: { AWS: 'arn:aws:iam::123456789012:user/Alice' }
        }
      ]
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return no errors for a resource policy with NotPrincipal', () => {
    //Given a resource policy with a NotPrincipal statement
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Deny',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*',
          NotPrincipal: { AWS: 'arn:aws:iam::123456789012:user/Alice' }
        }
      ]
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])
  })

  it('should return a lint error when a statement is missing both Principal and NotPrincipal', () => {
    //Given a resource policy whose only statement has no Principal or NotPrincipal
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*'
        }
      ]
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then a single lint error should be returned
    expect(errors).toEqual([
      {
        path: 'Statement[0]',
        message: 'One of Principal or NotPrincipal is required in a resource policy'
      }
    ])
  })

  it('should report only the offending indices when some statements have a Principal', () => {
    //Given a mixed resource policy where only some statements lack Principal
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*',
          Principal: '*'
        },
        {
          Effect: 'Allow',
          Action: 's3:PutObject',
          Resource: 'arn:aws:s3:::my-bucket/*'
        },
        {
          Effect: 'Deny',
          Action: 's3:DeleteObject',
          Resource: 'arn:aws:s3:::my-bucket/*'
        }
      ]
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then only the two offending indices are flagged
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        {
          path: 'Statement[1]',
          message: 'One of Principal or NotPrincipal is required in a resource policy'
        },
        {
          path: 'Statement[2]',
          message: 'One of Principal or NotPrincipal is required in a resource policy'
        }
      ])
    )
  })

  it('should flag a single-statement (non-array) resource policy missing Principal at path "Statement"', () => {
    //Given a resource policy whose Statement is a single object with no Principal
    const policy = {
      Version: '2012-10-17',
      Statement: {
        Effect: 'Allow',
        Action: 's3:GetObject',
        Resource: 'arn:aws:s3:::my-bucket/*'
      }
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then the error path is "Statement" (no array index)
    expect(errors).toEqual([
      {
        path: 'Statement',
        message: 'One of Principal or NotPrincipal is required in a resource policy'
      }
    ])
  })

  it('should not throw and should not emit missing-Principal errors for malformed or non-object inputs', () => {
    //Given inputs that are malformed but do not cause validateResourcePolicy to throw
    const cases: Array<{ input: any; label: string }> = [
      { label: 'undefined', input: undefined },
      { label: 'empty object', input: {} },
      { label: 'object with Version but no Statement', input: { Version: '2012-10-17' } },
      { label: 'empty Statement array', input: { Version: '2012-10-17', Statement: [] } },
      {
        label: 'Statement is a string',
        input: { Version: '2012-10-17', Statement: 'not-an-object' }
      },
      {
        label: 'Statement array containing a non-object entry',
        input: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::my-bucket/*',
              Principal: '*'
            },
            'not-an-object'
          ]
        }
      }
    ]

    for (const { input, label } of cases) {
      //When the resource policy is linted
      const run = () => lintResourcePolicy(input)

      //Then it should not throw
      expect(run, label).not.toThrow()

      //And no "One of Principal or NotPrincipal..." lint error should be produced from the malformed entries
      const errors = run()
      const missingPrincipalErrors = errors.filter(
        (e) => e.message === 'One of Principal or NotPrincipal is required in a resource policy'
      )
      expect(missingPrincipalErrors, `${label}: no missing-Principal lint errors`).toEqual([])
    }
  })

  it('should include duplicate Sid, empty action, and missing-Principal errors together', () => {
    //Given a resource policy with all three issues
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'Dup',
          Effect: 'Allow',
          Action: 's3:',
          Resource: 'arn:aws:s3:::my-bucket/*'
        },
        {
          Sid: 'Dup',
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*',
          Principal: '*'
        }
      ]
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then all three categories of issue should be reported
    expect(sortErrors(errors)).toEqual(
      sortErrors([
        {
          path: 'Statement[0]',
          message: 'One of Principal or NotPrincipal is required in a resource policy'
        },
        {
          path: 'Statement[0].Action',
          message: 'Action is empty for the service'
        },
        { path: 'Statement[0].Sid', message: 'Statement Ids (Sid) must be unique' },
        { path: 'Statement[1].Sid', message: 'Statement Ids (Sid) must be unique' }
      ])
    )
  })

  it('should surface resource-policy syntax errors through lintResourcePolicy', () => {
    //Given a resource policy with an invalid Effect
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'InvalidEffect',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*',
          Principal: '*'
        }
      ]
    }

    //When the resource policy is linted
    const errors = lintResourcePolicy(policy)

    //Then the Effect validation error from validateResourcePolicy should be present
    const hasEffectError = errors.some((e) => e.path === 'Statement[0].Effect')
    expect(hasEffectError).toBe(true)
  })
})
