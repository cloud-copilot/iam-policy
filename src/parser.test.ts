import { describe, expect, it } from 'vitest'
import { loadPolicy } from './parser.js'

describe('loadPolicy', () => {
  it('should return a Policy object for the backing policy document', () => {
    //Given a policy
    const policy = {
      Version: '2012-10-17',
      Statement: {
        Effect: 'Allow',
        Action: 's3:GetObject',
        Resource: 'arn:aws:s3:::my_corporate_bucket/*'
      }
    }

    //When loadPolicy is called
    const result = loadPolicy(policy)

    //Then a Policy object should be returned
    expect(result.version()).toBe('2012-10-17')
    expect(result.statements().length).toBe(1)
  })
})
