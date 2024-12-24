import { describe, expect, it } from 'vitest'
import { loadPolicy } from '../parser.js'

describe('ConditionImpl', () => {
  describe('paths', () => {
    it('should return correct paths', () => {
      // Given a policy with conditions
      const policy = loadPolicy({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:GetObject',
            Resource: '*',
            Condition: {
              StringEquals: {
                's3:ExistingObjectTag/department': 'sales',
                's3:RequestObjectTag/department': 'hr'
              },
              StringNotEqualsIfExists: {
                's3:RequestObjectTag/department': ['hr', 'finance']
              }
            }
          }
        ]
      })

      // When the conditions are created
      const conditions = policy.statements()[0]!.conditions()

      // Then the paths should be correct
      // Operator key path
      expect(conditions[0].operatorKeyPath()).toBe('Statement[0].Condition.#StringEquals')
      expect(conditions[1].operatorKeyPath()).toBe('Statement[0].Condition.#StringEquals')
      expect(conditions[2].operatorKeyPath()).toBe(
        'Statement[0].Condition.#StringNotEqualsIfExists'
      )

      // Operator value path
      expect(conditions[0].operatorValuePath()).toBe('Statement[0].Condition.StringEquals')
      expect(conditions[1].operatorValuePath()).toBe('Statement[0].Condition.StringEquals')
      expect(conditions[2].operatorValuePath()).toBe(
        'Statement[0].Condition.StringNotEqualsIfExists'
      )

      // Key path
      expect(conditions[0].keyPath()).toBe(
        'Statement[0].Condition.StringEquals.#s3:ExistingObjectTag/department'
      )
      expect(conditions[1].keyPath()).toBe(
        'Statement[0].Condition.StringEquals.#s3:RequestObjectTag/department'
      )
      expect(conditions[2].keyPath()).toBe(
        'Statement[0].Condition.StringNotEqualsIfExists.#s3:RequestObjectTag/department'
      )

      // Values path
      expect(conditions[0].valuesPath()).toBe(
        'Statement[0].Condition.StringEquals.s3:ExistingObjectTag/department'
      )
      expect(conditions[1].valuesPath()).toBe(
        'Statement[0].Condition.StringEquals.s3:RequestObjectTag/department'
      )
      expect(conditions[2].valuesPath()).toBe(
        'Statement[0].Condition.StringNotEqualsIfExists.s3:RequestObjectTag/department'
      )
    })
  })
})
