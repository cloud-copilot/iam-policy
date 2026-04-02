import { describe, expect, it } from 'vitest'
import { sortErrors } from '../validate/testutil.js'
import { findDuplicateSids, lintPolicy } from './lint.js'

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
