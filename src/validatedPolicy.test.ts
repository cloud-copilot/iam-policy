import { describe, expect, it } from 'vitest'
import { loadPolicy } from './parser.js'
import { validateIdentityPolicy } from './validate/validateTypes.js'
import {
  createValidatedPolicy,
  isValidatedPolicy,
  type ValidatedPolicy
} from './validatedPolicy.js'

describe('createValidatedPolicy', () => {
  it('should return a ValidatedPolicy with no errors for a valid policy', () => {
    //Given a valid identity policy
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*'
        }
      ]
    }

    //When we create a validated policy
    const result = createValidatedPolicy(policyDocument, validateIdentityPolicy)

    //Then it should have no errors and carry the raw document
    expect(result.__validated).toBe(true)
    expect(result.policyDocument).toBe(policyDocument)
    expect(result.errors).toEqual([])
    expect(result.metadata).toBeUndefined()
  })

  it('should return a ValidatedPolicy with errors for an invalid policy', () => {
    //Given an identity policy with a prohibited Principal field
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*'
        }
      ]
    }

    //When we create a validated policy
    const result = createValidatedPolicy(policyDocument, validateIdentityPolicy)

    //Then it should have errors
    expect(result.__validated).toBe(true)
    expect(result.policyDocument).toBe(policyDocument)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should store metadata alongside the validated policy', () => {
    //Given a valid policy and metadata
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: '*'
        }
      ]
    }
    const metadata = { name: 'arn:aws:iam::123456789012:policy/MyPolicy' }

    //When we create a validated policy with metadata
    const result = createValidatedPolicy(policyDocument, validateIdentityPolicy, metadata)

    //Then it should carry the metadata
    expect(result.metadata).toEqual({ name: 'arn:aws:iam::123456789012:policy/MyPolicy' })
  })
})

describe('isValidatedPolicy', () => {
  it('should return true for a ValidatedPolicy', () => {
    //Given a ValidatedPolicy
    const vp = createValidatedPolicy(
      { Version: '2012-10-17', Statement: [{ Effect: 'Allow', Action: '*', Resource: '*' }] },
      validateIdentityPolicy
    )

    //When we check it
    const result = isValidatedPolicy(vp)

    //Then it should be true
    expect(result).toBe(true)
  })

  it('should return false for a raw policy document', () => {
    //Given a raw policy document
    const raw = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: '*', Resource: '*' }]
    }

    //When we check it
    const result = isValidatedPolicy(raw)

    //Then it should be false
    expect(result).toBe(false)
  })

  it('should return false for null', () => {
    //When we check null
    const result = isValidatedPolicy(null)

    //Then it should be false
    expect(result).toBe(false)
  })

  it('should return false for undefined', () => {
    //When we check undefined
    const result = isValidatedPolicy(undefined)

    //Then it should be false
    expect(result).toBe(false)
  })
})

describe('loadPolicy with ValidatedPolicy', () => {
  it('should construct a Policy from a ValidatedPolicy using stored metadata', () => {
    //Given a ValidatedPolicy with metadata
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }]
    }
    const vp = createValidatedPolicy(policyDocument, validateIdentityPolicy, {
      name: 'test-policy'
    })

    //When we load it
    const policy = loadPolicy(vp)

    //Then it should be a working Policy with the stored metadata
    expect(policy.version()).toBe('2012-10-17')
    expect(policy.statements()).toHaveLength(1)
    expect(policy.metadata()).toEqual({ name: 'test-policy' })
  })

  it('should prefer explicit metadata over stored metadata', () => {
    //Given a ValidatedPolicy with metadata
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }]
    }
    const vp = createValidatedPolicy(policyDocument, validateIdentityPolicy, {
      name: 'stored-name'
    })

    //When we load it with explicit metadata
    const policy = loadPolicy(vp, { name: 'explicit-name' })

    //Then the explicit metadata should take precedence
    expect(policy.metadata()).toEqual({ name: 'explicit-name' })
  })

  it('should work after JSON round-trip (simulating SharedArrayBuffer serialization)', () => {
    //Given a ValidatedPolicy that has been serialized and deserialized
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }]
    }
    const vp = createValidatedPolicy(policyDocument, validateIdentityPolicy, {
      name: 'test-policy'
    })
    const roundTripped = JSON.parse(JSON.stringify(vp)) as ValidatedPolicy<{ name: string }>

    //When we load it
    const policy = loadPolicy(roundTripped)

    //Then it should still work correctly
    expect(isValidatedPolicy(roundTripped)).toBe(true)
    expect(roundTripped.errors).toEqual([])
    expect(policy.version()).toBe('2012-10-17')
    expect(policy.statements()).toHaveLength(1)
    expect(policy.metadata()).toEqual({ name: 'test-policy' })
  })

  it('should use stored metadata from a round-tripped ValidatedPolicy without metadata', () => {
    //Given a ValidatedPolicy without metadata, round-tripped
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{ Effect: 'Allow', Action: 's3:GetObject', Resource: '*' }]
    }
    const vp = createValidatedPolicy(policyDocument, validateIdentityPolicy)
    const roundTripped = JSON.parse(JSON.stringify(vp))

    //When we load it
    const policy = loadPolicy(roundTripped)

    //Then metadata should be undefined
    expect(policy.metadata()).toBeUndefined()
  })
})
