import { describe, expect, it } from 'vitest'
import { loadPolicy } from '../parser.js'
import { ActionStatement } from '../statements/statement.js'
import { ActionImpl } from './action.js'

describe('ActionImpl', () => {
  describe('path', () => {
    it('should return the path for a string value', () => {
      //Given a policy with an action string
      const policy = loadPolicy({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:GetObject',
            Resource: '*'
          }
        ]
      })

      // When the action is created
      const action = (policy.statements()[0] as ActionStatement)!.actions()[0]

      // Then the path should be correct
      expect(action.path()).toBe('Statement[0].Action')
    })

    it('should return the path for array values', () => {
      //Given a policy with an action array
      const policy = loadPolicy({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:GetObject', 's3:PutObject'],
            Resource: '*'
          }
        ]
      })

      // When the actions are created
      const actions = (policy.statements()[0] as ActionStatement)!.actions()

      //Then the paths should be correct
      expect(actions[0].path()).toBe('Statement[0].Action[0]')
      expect(actions[1].path()).toBe('Statement[0].Action[1]')
    })
  })
  describe('type', () => {
    it('should return wildcard when all wildcards', () => {
      // Given an action wildcard
      const actionString = '*'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.type()).toBe('wildcard')
    })

    it('should return service when not all wildcards', () => {
      // Given an action string
      const actionString = 's3:GetObject'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.type()).toBe('service')
    })
  })

  describe('wildcardValue', () => {
    it('should return the wildcard value', () => {
      // Given an action wildcard
      const actionString = '*'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.wildcardValue()).toBe('*')
    })
  })

  describe('value', () => {
    it('should return the value', () => {
      // Given an action string
      const actionString = 's3:GetObject'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.value()).toBe(actionString)
    })
  })

  describe('isWildcardAction', () => {
    it('should return true when wildcard', () => {
      // Given an action wildcard
      const actionString = '*'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.isWildcardAction()).toBe(true)
    })

    it('should return false when not wildcard', () => {
      // Given an action string
      const actionString = 's3:GetObject'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.isWildcardAction()).toBe(false)
    })
  })

  describe('isServiceAction', () => {
    it('should return true when service', () => {
      // Given an action string
      const actionString = 's3:GetObject'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.isServiceAction()).toBe(true)
    })

    it('should return false when not service', () => {
      // Given an action wildcard
      const actionString = '*'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.isServiceAction()).toBe(false)
    })
  })

  describe('service', () => {
    it('should return the service', () => {
      // Given an action string
      const actionString = 's3:GetObject'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.service()).toBe('s3')
    })
  })

  describe('action', () => {
    it('should return the action', () => {
      // Given an action string
      const actionString = 's3:GetObject'

      // When an ActionImpl is created
      const action = new ActionImpl(actionString, { path: 'Statement.Action' })

      // Assert
      expect(action.action()).toBe('GetObject')
    })
  })
})
