import { describe, expect, it } from "vitest"
import { AnnotatedActionStatement, AnnotatedNotActionStatement, AnnotatedNotPrincipalStatement, AnnotatedNotResourceStatement, AnnotatedPrincipalStatement, AnnotatedResourceStatement, AnnotatedStatement, StatementImpl } from "./statement.js"

describe('annotatedStatement', () => {
  it('should cache actions and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement & AnnotatedActionStatement = new StatementImpl({
      Effect: 'Allow',
      Action: [
        's3:GetObject',
        's3:PutObject'
      ],
      Resource: ['*'],
    }, 1, true)

    // And there are annotations on the actions
    const actions = statement.actions()
    actions[0].addAnnotation('key1', 'value1')
    actions[1].addAnnotation('key2', 'value2')

    // When I get the actions again
    const annotatedActions = statement.actions()

    // Then the annotations are still there
    expect(annotatedActions[0].getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedActions[1].getAnnotations().values('key2')).toEqual(['value2'])
  })

  it('should cache not actions and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement & AnnotatedNotActionStatement = new StatementImpl({
      Effect: 'Allow',
      NotAction: [
        's3:GetObject',
        's3:PutObject'
      ],
      Resource: ['*'],
    }, 1, true)

    // And there are annotations on the actions
    const notActions = statement.notActions()
    notActions[0].addAnnotation('key1', 'value1')
    notActions[1].addAnnotation('key2', 'value2')

    // When I get the actions again
    const annotatedNotActions = statement.notActions()

    // Then the annotations are still there
    expect(annotatedNotActions[0].getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedNotActions[1].getAnnotations().values('key2')).toEqual(['value2'])
  })

  it('should cache principals and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement & AnnotatedPrincipalStatement = new StatementImpl({
      Effect: 'Allow',
      Principal: {
        AWS: [
          'arn:aws:iam::123456789012:root',
          'arn:aws:iam::123456789012:user/Bob'
        ]
      },
      Action: ['s3:GetObject'],
      Resource: ['*'],
    }, 1, true)

    // And there are annotations on the principal
    const [principal1, principal2] = statement.principals()
    principal1.addAnnotation('key1', 'value1')
    principal2.addAnnotation('key2', 'value2')

    // When the principals are retrieved again
    const [annotatedPrincipal1, annotatedPrincipal2] = statement.principals()

    // Then the annotations are still there
    expect(annotatedPrincipal1.getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedPrincipal2.getAnnotations().values('key2')).toEqual(['value2'])
  })

  it('should cache NotPrincipals and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement & AnnotatedNotPrincipalStatement = new StatementImpl({
      Effect: 'Allow',
      NotPrincipal: {
        AWS: [
          'arn:aws:iam::123456789012:root',
          'arn:aws:iam::123456789012:user/Bob'
        ]
      },
      Action: ['s3:GetObject'],
      Resource: ['*'],
    }, 1, true)

    // And there are annotations on the principal
    const [principal1, principal2] = statement.notPrincipals()
    principal1.addAnnotation('key1', 'value1')
    principal2.addAnnotation('key2', 'value2')

    // When the principals are retrieved again
    const [annotatedPrincipal1, annotatedPrincipal2] = statement.notPrincipals()

    // Then the annotations are still there
    expect(annotatedPrincipal1.getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedPrincipal2.getAnnotations().values('key2')).toEqual(['value2'])
  })

  it('should cache resources and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement & AnnotatedResourceStatement = new StatementImpl({
      Effect: 'Allow',
      Action: ['s3:GetObject'],
      Resource: ['arn:aws:s3:::bucket1/*', 'arn:aws:s3:::bucket2/*'],
    }, 1, true)

    // And there are annotations on the resource
    const [resource1, resource2] = statement.resources()
    resource1.addAnnotation('key1', 'value1')
    resource2.addAnnotation('key2', 'value2')

    // When the resources are retrieved again
    const [annotatedResource1, annotatedResource2] = statement.resources()

    // Then the annotations are still there
    expect(annotatedResource1.getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedResource2.getAnnotations().values('key2')).toEqual(['value2'])
  })

  it('should cache NotResources and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement & AnnotatedNotResourceStatement = new StatementImpl({
      Effect: 'Allow',
      Action: ['s3:GetObject'],
      NotResource: ['arn:aws:s3:::bucket1/*', 'arn:aws:s3:::bucket2/*'],
    }, 1, true)

    // And there are annotations on the resource
    const [resource1, resource2] = statement.notResources()
    resource1.addAnnotation('key1', 'value1')
    resource2.addAnnotation('key2', 'value2')

    // When the resources are retrieved again
    const [annotatedResource1, annotatedResource2] = statement.notResources()

    // Then the annotations are still there
    expect(annotatedResource1.getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedResource2.getAnnotations().values('key2')).toEqual(['value2'])
  })

  it('should cache conditions and their annotations', () => {
    // Given an annotated statement
    const statement: AnnotatedStatement = new StatementImpl({
      Effect: 'Allow',
      Action: ['s3:GetObject'],
      Resource: ['*'],
      Condition: {
        StringEquals: {
          's3:prefix': 'home/${aws:username}'
        },
        ArnLike: {
          'aws:PrincipalArn': 'arn:aws:iam::*:user/key-user'
        }
      }
    }, 1, true)

    // And there are annotations on the condition
    const [condition1, condition2] = statement.conditions()
    condition1.addAnnotation('key1', 'value1')
    condition2.addAnnotation('key2', 'value2')

    // When the condition is retrieved again
    const [annotatedCondition1, annotatedCondition2] = statement.conditions()

    // Then the annotations are still there
    expect(annotatedCondition1.getAnnotations().values('key1')).toEqual(['value1'])
    expect(annotatedCondition2.getAnnotations().values('key2')).toEqual(['value2'])
  })
})