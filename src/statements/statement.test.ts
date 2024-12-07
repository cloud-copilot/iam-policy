import { describe, expect, it } from 'vitest'
import { StatementImpl } from './statement.js'

describe('StatementImpl', () => {

  describe('sid', () => {
    it('should return the sid of the statement', () => {
      //Given a statement with a sid of 'MySid'
      const statementDoc = { Sid: 'MySid'}

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then the sid should be 'MySid'
      expect(statement.sid()).toBe('MySid')
    })
  })

  describe('effect', () => {
    it('should return the effect of the statement', () => {
      //Given a statement with an effect of 'Deny'
      const statementDoc = { Effect: 'Deny' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then the effect should be 'Deny'
      expect(statement.effect()).toBe('Deny')
    })
  })

  describe('isAllow', () => {
    it('should return true if the effect is Allow', () => {
      //Given a statement with an effect of 'Allow'
      const statementDoc = { Effect: 'Allow' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isAllow should return true
      expect(statement.isAllow()).toBe(true)
    })

    it('should return false if the effect is not Allow', () => {
      //Given a statement with an effect of 'Deny'
      const statementDoc = { Effect: 'Deny' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isAllow should return false
      expect(statement.isAllow()).toBe(false)
    })
  })

  describe('isDeny', () => {
    it('should return true if the effect is Deny', () => {
      //Given a statement with an effect of 'Deny'
      const statementDoc = { Effect: 'Deny' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isDeny should return true
      expect(statement.isDeny()).toBe(true)
    })

    it('should return false if the effect is not Deny', () => {
      //Given a statement with an effect of 'Allow'
      const statementDoc = { Effect: 'Allow' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isDeny should return false
      expect(statement.isDeny()).toBe(false)
    })
  })

  describe('isPrincipalStatement', () => {
    it('should return true if the statement has a Principal', () => {
      //Given a statement with a Principal
      const statementDoc = { Principal: {} }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isPrincipalStatement should return true
      expect(statement.isPrincipalStatement()).toBe(true)
    })

    it('should return false if the statement does not have a Principal', () => {
      //Given a statement without a Principal
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isPrincipalStatement should return false
      expect(statement.isPrincipalStatement()).toBe(false)
    })
  })

  describe('isNotPrincipalStatement', () => {
    it('should return true if the statement has a NotPrincipal', () => {
      //Given a statement with a NotPrincipal
      const statementDoc = { NotPrincipal: {} }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isNotPrincipalStatement should return true
      expect(statement.isNotPrincipalStatement()).toBe(true)
    })

    it('should return false if the statement does not have a NotPrincipal', () => {
      //Given a statement without a NotPrincipal
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isNotPrincipalStatement should return false
      expect(statement.isNotPrincipalStatement()).toBe(false)
    })
  })

  describe('principals', () => {
    it('should return a wildcard principal string', () => {
      //Given a statement with a Principal with a wildcard
      const statementDoc = { Principal: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then principals should return a Principal with a wildcard
      expect(statement.principals().length).toEqual(1)
      expect(statement.principals()[0].type()).toEqual('AWS')
      expect(statement.principals()[0].value()).toEqual('*')
    })

    it('should return an AWS principal string', () => {
      //Given a statement with a Principal with an AWS principal
      const statementDoc = { Principal: { "AWS": "*" } }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then principals should return a Principal with an AWS principal
      expect(statement.principals().length).toEqual(1)
      expect(statement.principals()[0].type()).toEqual('AWS')
      expect(statement.principals()[0].value()).toEqual('*')
    })

    it('should return multiple AWS principals', () => {
      //Given a statement with a Principal with multiple AWS principals
      const statementDoc = { Principal: { "AWS": ["arn:aws:iam::123456789012:root", "arn:aws:iam::123456789012:user/Bob"] } }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then principals should return multiple Principals with AWS principals
      expect(statement.principals().length).toEqual(2)
      expect(statement.principals()[0].type()).toEqual('AWS')
      expect(statement.principals()[0].value()).toEqual('arn:aws:iam::123456789012:root')
      expect(statement.principals()[1].type()).toEqual('AWS')
      expect(statement.principals()[1].value()).toEqual('arn:aws:iam::123456789012:user/Bob')
    })

    it('should throw an error if principals is called on a statement without Principal', () => {
      //Given a statement without a Principal
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then principals should throw an error
      expect(() => statement.principals()).toThrow('Called principals on a statement without Principal, use isPrincipalStatement before calling principals')
    })
  })

  describe('notPrincipals', () => {
    // We don't have as many tests for notPrincipals because the implementation is the same as principals
    it('should return a wildcard principal string', () => {
      //Given a statement with a NotPrincipal with a wildcard
      const statementDoc = { NotPrincipal: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notPrincipals should return a Principal with a wildcard
      expect(statement.notPrincipals().length).toEqual(1)
      expect(statement.notPrincipals()[0].type()).toEqual('AWS')
      expect(statement.notPrincipals()[0].value()).toEqual('*')
    })

    it('should throw an error if notPrincipals is called on a statement without NotPrincipal', () => {
      //Given a statement without a NotPrincipal
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notPrincipals should throw an error
      expect(() => statement.notPrincipals()).toThrow('Called notPrincipals on a statement without NotPrincipal, use isNotPrincipalStatement before calling notPrincipals')
    })
  })

  describe('isActionStatement', () => {
    it('should return true if the statement has an Action', () => {
      //Given a statement with an Action
      const statementDoc = { Action: {} }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isActionStatement should return true
      expect(statement.isActionStatement()).toBe(true)
    })

    it('should return false if the statement does not have an Action', () => {
      //Given a statement without an Action
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isActionStatement should return false
      expect(statement.isActionStatement()).toBe(false)
    })
  })

  describe('isNotActionStatement', () => {
    it('should return true if the statement has a NotAction', () => {
      //Given a statement with a NotAction
      const statementDoc = { NotAction: {} }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isNotActionStatement should return true
      expect(statement.isNotActionStatement()).toBe(true)
    })

    it('should return false if the statement does not have a NotAction', () => {
      //Given a statement without a NotAction
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isNotActionStatement should return false
      expect(statement.isNotActionStatement()).toBe(false)
    })
  })

  describe('actions', () => {
    it('should return a wildcard action string', () => {
      //Given a statement with an Action with a wildcard
      const statementDoc = { Action: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then actions should return an Action with a wildcard
      expect(statement.actions().length).toEqual(1)
      expect(statement.actions()[0].value()).toEqual('*')
      expect(statement.actions()[0].isWildcardAction()).toBe(true)
    })

    it('should return an action string', () => {
      //Given a statement with an Action
      const statementDoc = { Action: 's3:GetObject' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then actions should return an Action
      expect(statement.actions().length).toEqual(1)
      expect(statement.actions()[0].value()).toEqual('s3:GetObject')
    })

    it('should return multiple actions', () => {
      //Given a statement with multiple Actions
      const statementDoc = { Action: ['s3:GetObject', 's3:PutObject'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then actions should return multiple Actions
      expect(statement.actions().length).toEqual(2)
      expect(statement.actions()[0].value()).toEqual('s3:GetObject')
      expect(statement.actions()[1].value()).toEqual('s3:PutObject')
    })

    it('should throw an error if actions is called on a statement without Action', () => {
      //Given a statement without an Action
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then actions should throw an error
      expect(() => statement.actions()).toThrow('Called actions on a statement without Action, use isActionStatement before calling actions')
    })
  })

  describe('notActions', () => {
    it('should return a wildcard action string', () => {
      //Given a statement with a NotAction with a wildcard
      const statementDoc = { NotAction: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notActions should return an Action with a wildcard
      expect(statement.notActions().length).toEqual(1)
      expect(statement.notActions()[0].value()).toEqual('*')
      expect(statement.notActions()[0].isWildcardAction()).toBe(true)
    })

    it('should return multiple actions', () => {
      //Given a statement with multiple NotActions
      const statementDoc = { NotAction: ['s3:GetObject', 's3:PutObject'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notActions should return multiple Actions
      expect(statement.notActions().length).toEqual(2)
      expect(statement.notActions()[0].value()).toEqual('s3:GetObject')
      expect(statement.notActions()[1].value()).toEqual('s3:PutObject')
    })

    it('should throw an error if notActions is called on a statement without NotAction', () => {
      //Given a statement without a NotAction
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notActions should throw an error
      expect(() => statement.notActions()).toThrow('Called notActions on a statement without NotAction, use isNotActionStatement before calling notActions')
    })
  })

  describe('isResourceStatement', () => {
    it('should return true if the statement has a Resource', () => {
      //Given a statement with a Resource
      const statementDoc = { Resource: {} }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isResourceStatement should return true
      expect(statement.isResourceStatement()).toBe(true)
    })

    it('should return false if the statement does not have a Resource', () => {
      //Given a statement without a Resource
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isResourceStatement should return false
      expect(statement.isResourceStatement()).toBe(false)
    })
  })

  describe('isNotResourceStatement', () => {
    it('should return true if the statement has a NotResource', () => {
      //Given a statement with a NotResource
      const statementDoc = { NotResource: {} }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isNotResourceStatement should return true
      expect(statement.isNotResourceStatement()).toBe(true)
    })

    it('should return false if the statement does not have a NotResource', () => {
      //Given a statement without a NotResource
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then isNotResourceStatement should return false
      expect(statement.isNotResourceStatement()).toBe(false)
    })
  })

  describe('resources', () => {
    it('should return a wildcard resource string', () => {
      //Given a statement with a Resource with a wildcard
      const statementDoc = { Resource: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then resources should return a Resource with a wildcard
      expect(statement.resources().length).toEqual(1)
      expect(statement.resources()[0].value()).toEqual('*')
    })

    it('should return a resource string', () => {
      //Given a statement with a Resource
      const statementDoc = { Resource: 'arn:aws:s3:::my_bucket' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then resources should return a Resource
      expect(statement.resources().length).toEqual(1)
      expect(statement.resources()[0].value()).toEqual('arn:aws:s3:::my_bucket')
    })

    it('should return multiple resources', () => {
      //Given a statement with multiple Resources
      const statementDoc = { Resource: ['arn:aws:s3:::my_bucket', 'arn:aws:s3:::my_other_bucket'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then resources should return multiple Resources
      expect(statement.resources().length).toEqual(2)
      expect(statement.resources()[0].value()).toEqual('arn:aws:s3:::my_bucket')
      expect(statement.resources()[1].value()).toEqual('arn:aws:s3:::my_other_bucket')
    })

    it('should throw an error if resources is called on a statement without Resource', () => {
      //Given a statement without a Resource
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then resources should throw an error
      expect(() => statement.resources()).toThrow('Called resources on a statement without Resource, use isResourceStatement before calling resources')
    })
  })

  describe('notResources', () => {
    it('should return a wildcard resource string', () => {
      //Given a statement with a NotResource with a wildcard
      const statementDoc = { NotResource: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notResources should return a Resource with a wildcard
      expect(statement.notResources().length).toEqual(1)
      expect(statement.notResources()[0].value()).toEqual('*')
    })

    it('should return multiple resources', () => {
      //Given a statement with multiple NotResources
      const statementDoc = { NotResource: ['arn:aws:s3:::my_bucket', 'arn:aws:s3:::my_other_bucket'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notResources should return multiple Resources
      expect(statement.notResources().length).toEqual(2)
      expect(statement.notResources()[0].value()).toEqual('arn:aws:s3:::my_bucket')
      expect(statement.notResources()[1].value()).toEqual('arn:aws:s3:::my_other_bucket')
    })

    it('should throw an error if notResources is called on a statement without NotResource', () => {
      //Given a statement without a NotResource
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notResources should throw an error
      expect(() => statement.notResources()).toThrow('Called notResources on a statement without NotResource, use isNotResourceStatement before calling notResources')
    })
  })

  describe('hasSingleResourceWildcard', () => {
    it('should return true if the statement has a single Resource wildcard', () => {
      //Given a statement with a single Resource wildcard
      const statementDoc = { Resource: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleResourceWildcard should return true
      expect(statement.hasSingleResourceWildcard()).toBe(true)
    })

    it('should return false if the statement has an array with a single Resource wildcard', () => {
      //Given a statement with an array with a single Resource wildcard
      const statementDoc = { Resource: ['*'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleResourceWildcard should return false
      expect(statement.hasSingleResourceWildcard()).toBe(false)
    })

    it('should return false if the statement does not have a single Resource wildcard', () => {
      //Given a statement without a single Resource wildcard
      const statementDoc = { Resource: ['arn:aws:s3:::my_bucket', 'arn:aws:s3:::my_other_bucket'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleResourceWildcard should return false
      expect(statement.hasSingleResourceWildcard()).toBe(false)
    })

    it('should throw an error if hasSingleResourceWildcard is called on a statement without Resource', () => {
      //Given a statement without a Resource
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleResourceWildcard should throw an error
      expect(() => statement.hasSingleResourceWildcard()).toThrow('Called hasSingleResourceWildcard on a statement without Resource, use isResourceStatement before calling hasSingleResourceWildcard')
    })
  })

  describe('hasSingleNotResourceWildcard', () => {
    it('should return true if the statement has a single NotResource wildcard', () => {
      //Given a statement with a single NotResource wildcard
      const statementDoc = { NotResource: '*' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleNotResourceWildcard should return true
      expect(statement.hasSingleNotResourceWildcard()).toBe(true)
    })

    it('should return false if the statement has an array with a single NotResource wildcard', () => {
      //Given a statement with an array with a single NotResource wildcard
      const statementDoc = { NotResource: ['*'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleNotResourceWildcard should return false
      expect(statement.hasSingleNotResourceWildcard()).toBe(false)
    })

    it('should return false if the statement does not have a single NotResource wildcard', () => {
      //Given a statement without a single NotResource wildcard
      const statementDoc = { NotResource: ['arn:aws:s3:::my_bucket', 'arn:aws:s3:::my_other_bucket'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleNotResourceWildcard should return false
      expect(statement.hasSingleNotResourceWildcard()).toBe(false)
    })

    it('should throw an error if hasSingleNotResourceWildcard is called on a statement without NotResource', () => {
      //Given a statement without a NotResource
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then hasSingleNotResourceWildcard should throw an error
      expect(() => statement.hasSingleNotResourceWildcard()).toThrow('Called hasSingleNotResourceWildcard on a statement without NotResource, use isNotResourceStatement before calling hasSingleNotResourceWildcard')
    })
  })

  describe('resourceIsArray', () => {
    it('should return true if the resource is an array', () => {
      //Given a statement with a Resource that is an array
      const statementDoc = { Resource: ['arn:aws:s3:::my_bucket', 'arn:aws:s3:::my_other_bucket'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then resourceIsArray should return true
      expect(statement.resourceIsArray()).toBe(true)
    })

    it('should return false if the resource is not an array', () => {
      //Given a statement with a Resource that is not an array
      const statementDoc = { Resource: 'arn:aws:s3:::my_bucket' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then resourceIsArray should return false
      expect(statement.resourceIsArray()).toBe(false)
    })
  })

  describe('notResourceIsArray', () => {
    it('should return true if the NotResource is an array', () => {
      //Given a statement with a NotResource that is an array
      const statementDoc = { NotResource: ['arn:aws:s3:::my_bucket', 'arn:aws:s3:::my_other_bucket'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notResourceIsArray should return true
      expect(statement.notResourceIsArray()).toBe(true)
    })

    it('should return false if the NotResource is not an array', () => {
      //Given a statement with a NotResource that is not an array
      const statementDoc = { NotResource: 'arn:aws:s3:::my_bucket' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notResourceIsArray should return false
      expect(statement.notResourceIsArray()).toBe(false)
    })
  })

  describe('conditions', () => {
    it('should return an empty array if the statement does not have a Condition', () => {
      //Given a statement without a Condition
      const statementDoc = { }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then conditions should return an empty array
      expect(statement.conditions()).toEqual([])
    })

    it('should return the conditions when the condition value is a string', () => {
      //Given a statement with a Condition with a string value
      const statementDoc = {
        Condition: {
           StringEquals: {
             "s3:prefix": "home/${aws:username}"
           }
        }
      }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then conditions should return the Condition
      expect(statement.conditions().length).toEqual(1)
      expect(statement.conditions()[0].operation().value()).toEqual('StringEquals')
      expect(statement.conditions()[0].conditionKey()).toEqual('s3:prefix')
      expect(statement.conditions()[0].conditionValues()).toEqual(['home/${aws:username}'])
      expect(statement.conditions()[0].valueIsArray()).toBe(false)
    })

    it('should return the conditions when the condition value is a string array', () => {
      //Given a statement with a Condition with a string array value
      const statementDoc = {
        Condition: {
           StringEquals: {
             "s3:prefix": ["home/${aws:username}", "home/${aws:username}/"]
           }
        }
      }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then conditions should return the Condition
      expect(statement.conditions().length).toEqual(1)
      expect(statement.conditions()[0].operation().value()).toEqual('StringEquals')
      expect(statement.conditions()[0].conditionKey()).toEqual('s3:prefix')
      expect(statement.conditions()[0].conditionValues()).toEqual(['home/${aws:username}', 'home/${aws:username}/'])
    })

    it('should return multiple conditions', () => {
      //Given a statement with multiple Conditions
      const statementDoc = {
        Condition: {
           StringEquals: {
             "s3:prefix": "home/${aws:username}",
             "aws:PrincipalOrgID": "o-1234567890"
           },
           StringLike: {
             "s3:prefix": "home/${aws:username}",
             "aws:TagKeys/Foo": "Bar*"
           }
        }
      }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then conditions should return multiple Conditions
      expect(statement.conditions().length).toEqual(4)
      expect(statement.conditions()[0].operation().value()).toEqual('StringEquals')
      expect(statement.conditions()[0].conditionKey()).toEqual('s3:prefix')
      expect(statement.conditions()[0].conditionValues()).toEqual(['home/${aws:username}'])
      expect(statement.conditions()[1].operation().value()).toEqual('StringEquals')
      expect(statement.conditions()[1].conditionKey()).toEqual('aws:PrincipalOrgID')
      expect(statement.conditions()[1].conditionValues()).toEqual(['o-1234567890'])
      expect(statement.conditions()[2].operation().value()).toEqual('StringLike')
      expect(statement.conditions()[2].conditionKey()).toEqual('s3:prefix')
      expect(statement.conditions()[2].conditionValues()).toEqual(['home/${aws:username}'])
      expect(statement.conditions()[3].operation().value()).toEqual('StringLike')
      expect(statement.conditions()[3].conditionKey()).toEqual('aws:TagKeys/Foo')
      expect(statement.conditions()[3].conditionValues()).toEqual(['Bar*'])
    })
  })

  describe('actionIsArray', () => {
    it('should return true if the action is an array', () => {
      //Given a statement with an Action that is an array
      const statementDoc = { Action: ['s3:GetObject', 's3:PutObject'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then actionIsArray should return true
      expect(statement.actionIsArray()).toBe(true)
    })

    it('should return false if the action is not an array', () => {
      //Given a statement with an Action that is not an array
      const statementDoc = { Action: 's3:GetObject' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then actionIsArray should return false
      expect(statement.actionIsArray()).toBe(false)
    })
  })

  describe('notActionIsArray', () => {
    it('should return true if the NotAction is an array', () => {
      //Given a statement with a NotAction that is an array
      const statementDoc = { NotAction: ['s3:GetObject', 's3:PutObject'] }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notActionIsArray should return true
      expect(statement.notActionIsArray()).toBe(true)
    })

    it('should return false if the NotAction is not an array', () => {
      //Given a statement with a NotAction that is not an array
      const statementDoc = { NotAction: 's3:GetObject' }

      //When a StatementImpl is created with the statement
      const statement = new StatementImpl(statementDoc, 0, false)

      //Then notActionIsArray should return false
      expect(statement.notActionIsArray()).toBe(false)
    })
  })
})