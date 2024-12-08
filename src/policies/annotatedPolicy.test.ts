import { describe, expect, it } from 'vitest'
import { AnnotatedPolicy, PolicyImpl } from './policy.js'

describe('AnnotatedPolicy', () => {
  it('should maintain annotations', () => {
    // Given an annotated policy
    const policy = {
      Statement: {
        Effect: 'Allow',
        Action: 's3:GetObject',
        Resource: 'arn:aws:s3:::examplebucket/*'
      }
    }
    const annotatedPolicy = new PolicyImpl(policy, true)

    // When an annotation is added
    annotatedPolicy.addAnnotation('testAnnotation', 'Value1')
    annotatedPolicy.addAnnotation('testAnnotation', 'Value2')

    // Then the annotation should be maintained
    const policyAnnotations = annotatedPolicy.getAnnotations()
    expect(policyAnnotations.values('testAnnotation')).toEqual(['Value1', 'Value2'])
  })

  it('should cache statements and their annotations', () => {
    //Given a policy with multiple statements
    const policy = {
      Statement: [
        {
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::examplebucket/*'
        },
        {
          Effect: 'Allow',
          Action: 's3:PutObject',
          Resource: 'arn:aws:s3:::examplebucket/*'
        }
      ]
    }

    const annotatedPolicy: AnnotatedPolicy = new PolicyImpl(policy, true)

    // When annotations are added to the statements
    const statement1 = annotatedPolicy.statements().at(0)!
    statement1.addAnnotation('testAnnotation', 'Value1')
    statement1.addAnnotation('testAnnotation', 'Value2')
    const statement2 = annotatedPolicy.statements().at(1)!
    statement2.addAnnotation('testAnnotation', 'Value3')
    statement2.addAnnotation('testAnnotation', 'Value4')

    // When the statements are retrieved
    const [newStatement1, newStatement2] = annotatedPolicy.statements()

    // Then the annotations should be maintained
    expect(newStatement1.getAnnotations().values('testAnnotation')).toEqual(['Value1', 'Value2'])
    expect(newStatement2.getAnnotations().values('testAnnotation')).toEqual(['Value3', 'Value4'])
  })
})
