import { describe, expect, it } from 'vitest'
import { ActionImpl } from './action.js'

describe('ActionImpl', () => {
  describe('type', () => {
    it('should return wildcard when all wildcards', () => {
      // Given an action wildcard
      const actionString = "*"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.type()).toBe('wildcard')
    })

    it('should return service when not all wildcards', () => {
      // Given an action string
      const actionString = "s3:GetObject"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.type()).toBe('service')
    })
  })

  describe('wildcardValue', () => {
    it('should return the wildcard value', () => {
      // Given an action wildcard
      const actionString = "*"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.wildcardValue()).toBe('*')
    })
  })

  describe('value', () => {
    it('should return the value', () => {
      // Given an action string
      const actionString = "s3:GetObject"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.value()).toBe(actionString)
    })
  })

  describe('isWildcardAction', () => {
    it('should return true when wildcard', () => {
      // Given an action wildcard
      const actionString = "*"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.isWildcardAction()).toBe(true)
    })

    it('should return false when not wildcard', () => {
      // Given an action string
      const actionString = "s3:GetObject"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.isWildcardAction()).toBe(false)
    })
  })

  describe('isServiceAction', () => {
    it('should return true when service', () => {
      // Given an action string
      const actionString = "s3:GetObject"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.isServiceAction()).toBe(true)
    })

    it('should return false when not service', () => {
      // Given an action wildcard
      const actionString = "*"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.isServiceAction()).toBe(false)
    })
  })

  describe('service', () => {
    it('should return the service', () => {
      // Given an action string
      const actionString = "s3:GetObject"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.service()).toBe('s3')
    })
  })

  describe('action', () => {
    it('should return the action', () => {
      // Given an action string
      const actionString = "s3:GetObject"

      // When an ActionImpl is created
      const action = new ActionImpl(actionString)

      // Assert
      expect(action.action()).toBe('GetObject')
    })
  })
})