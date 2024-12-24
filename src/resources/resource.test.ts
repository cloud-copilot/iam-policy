import { describe, expect, it } from 'vitest'
import { loadPolicy } from '../parser.js'
import { ResourceStatement } from '../statements/statement.js'
import { ResourceImpl } from './resource.js'

describe('ResourceImpl', () => {
  describe('path', () => {
    it('should return the path for a single resource', () => {
      //Given a policy with a single resource
      const policy = loadPolicy({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:GetObject',
            Resource: 'arn:aws:s3:::my_corporate_bucket/*'
          }
        ]
      })

      // When the recource is extracted
      const resource = (policy.statements()[0] as ResourceStatement).resources()[0]

      // Then the path should be "Resource"
      expect(resource.path()).toBe('Statement[0].Resource')
    })

    it('should return the path for multiple resources', () => {
      //Given a policy with multiple resources
      const policy = loadPolicy({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:GetObject',
            Resource: ['arn:aws:s3:::my_corporate_bucket/*', 'arn:aws:s3:::my_corporate_bucket2/*']
          }
        ]
      })

      // When the recources are extracted
      const resources = (policy.statements()[0] as ResourceStatement).resources()

      // Then the path should be "Statement[0].Resource[0]" and "Statement[0].Resource[1]"
      expect(resources[0].path()).toBe('Statement[0].Resource[0]')
      expect(resources[1].path()).toBe('Statement[0].Resource[1]')
    })
  })

  describe('value', () => {
    it('should return the value', () => {
      // Given a resource string
      const resourceString = 'arn:aws:s3:::my_corporate_bucket/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the value should be the resource string
      expect(resource.value()).toBe(resourceString)
    })
  })

  describe('isAllResources', () => {
    it('should return true when all resources', () => {
      // Given a resource wildcard
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the isAllResources should be true
      expect(resource.isAllResources()).toBe(true)
    })

    it('should return false when not all resources', () => {
      // Given a resource string
      const resourceString = 'arn:aws:s3:::my_corporate_bucket/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the isAllResources should be false
      expect(resource.isAllResources()).toBe(false)
    })
  })

  describe('isArnResource', () => {
    it('should return true when ARN resource', () => {
      // Given an ARN resource string
      const resourceString = 'arn:aws:s3:::my_corporate_bucket/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then isArnResource should be true
      expect(resource.isArnResource()).toBe(true)
    })

    it('should return false when not ARN resource', () => {
      // Given a non-ARN resource string
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then isArnResource should be false
      expect(resource.isArnResource()).toBe(false)
    })
  })

  describe('partition', () => {
    it('should return the partition', () => {
      // Given an ARN resource string
      const resourceString = 'arn:aws:s3:::my_corporate_bucket/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the partition should be "aws"
      expect(resource.partition()).toBe('aws')
    })

    it('should throw an error when not an ARN resource', () => {
      // Given a non-ARN resource string
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then an error should be thrown
      expect(() => resource.partition()).toThrowError(
        'Called partition on a resource without an ARN, use isArnResource before calling partition'
      )
    })
  })

  describe('service', () => {
    it('should return the service', () => {
      // Given an ARN resource string
      const resourceString = 'arn:aws:s3:::my_corporate_bucket/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the service should be "s3"
      expect(resource.service()).toBe('s3')
    })

    it('should throw an error when not an ARN resource', () => {
      // Given a non-ARN resource string
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then an error should be thrown
      expect(() => resource.service()).toThrowError(
        'Called service on a resource without an ARN, use isArnResource before calling service'
      )
    })
  })

  describe('region', () => {
    it('should return the region', () => {
      // Given an ARN resource string
      const resourceString = 'arn:aws:ec2:us-east-1:123456789012:instance/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the region should be undefined
      expect(resource.region()).toEqual('us-east-1')
    })

    it('should throw an error when not an ARN resource', () => {
      // Given a non-ARN resource string
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then an error should be thrown
      expect(() => resource.region()).toThrowError(
        'Called region on a resource without an ARN, use isArnResource before calling region'
      )
    })
  })

  describe('account', () => {
    it('should return the account', () => {
      // Given an ARN resource string
      const resourceString = 'arn:aws:ec2:us-east-1:123456789012:instance/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the account should be "123456789012"
      expect(resource.account()).toEqual('123456789012')
    })

    it('should throw an error when not an ARN resource', () => {
      // Given a non-ARN resource string
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then an error should be thrown
      expect(() => resource.account()).toThrowError(
        'Called account on a resource without an ARN, use isArnResource before calling account'
      )
    })
  })

  describe('resource', () => {
    it('should return the resource', () => {
      // Given an ARN resource string
      const resourceString = 'arn:aws:ec2:us-east-1:123456789012:instance/*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the resource should be "instance/*"
      expect(resource.resource()).toEqual('instance/*')
    })

    it('should return the resource if the resource contains a colon', () => {
      // Given an ARN resource string
      const resourceString =
        'arn:aws:backup:us-east-1:222222222222:backup-vault:aws/efs/automatic-backup-vault'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then the resource should be "instance:my-instance"
      expect(resource.resource()).toEqual('backup-vault:aws/efs/automatic-backup-vault')
    })

    it('should throw an error when not an ARN resource', () => {
      // Given a non-ARN resource string
      const resourceString = '*'

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString, { path: 'Resource' })

      // Then an error should be thrown
      expect(() => resource.resource()).toThrowError(
        'Called resource on a resource without an ARN, use isArnResource before calling resource'
      )
    })
  })
})
