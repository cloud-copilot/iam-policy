# IAM Policy Syntax Validator and Parser

[![NPM Version](https://img.shields.io/npm/v/@cloud-copilot/iam-policy.svg?logo=nodedotjs)](https://www.npmjs.com/package/@cloud-copilot/iam-policy) [![License: AGPL v3](https://img.shields.io/github/license/cloud-copilot/iam-policy)](LICENSE.txt)

This is a simple IAM policy library that allows you to safely parse and navigate IAM policies without worrying about the more difficult details of parsing policies or validating syntax.

This may be updated in the future to allow modifying policies, right now it's read-only.

## Validate Policy Syntax with `validatePolicySyntax`

`validatePolicySyntax` is a syntax linter and will not validate the the policy is logical, secure, or correct.

This will take any object and return back an array of findings. If the array is empty then the policy is valid.

```typescript
import { validatePolicySyntax } from '@cloud-copilot/iam-policy'

validatePolicySyntax({
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'VisualEditor0',
      Effect: 'Allow',
      Action: 's3:GetObject',
      Resource: 'arn:aws:s3:::mybucket/*'
    }
  ]
}) // []

validatePolicySyntax({
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 7,
      Effect: 'Allow',
      Action: 's3:GetObject',
      Resource: 'arn:aws:s3:::mybucket/*'
    }
  ]
}) // [{ message: 'Found data type number allowed type(s) are string', path: 'Statement[0].Sid'}]

/* It will attempt to find as many issues as possible in one pass */
validatePolicySyntax({
  Version: '2012-10-17',
  Comment: 'Jacob is kewl',
  Statement: [
    {
      Sid: 'SomeStatement',
      Effect: 7,
      Action: 's3:GetObject',
      Resource: 'arn:aws:s3:::mybucket/*'
    },
    {
      Sid: 'SomeStatement',
      Effect: ['Allow'],
      Action: 's3:GetObject',
      Resource: 'arn:aws:s3:::mybucket/*',
      Condition: {
        NumericLessThan: {
          's3:max-keys': 7
        },
        StringLike: {
          's3:authType': new RegExp(/REST.*/),
          'aws:TagKeys/Foo': ['Bar*', 'Baz*']
        }
      }
    }
  ]
}) /*
[
  { message: 'Invalid key Comment', path: 'Comment' },
  { message: 'Effect must be present and exactly "Allow" or "Deny"', path: 'Statement[0].Effect' },
  { message: 'Effect must be present and exactly "Allow" or "Deny"', path: 'Statement[1].Effect' },
  { message: 'Found data type number allowed type(s) are string', path: 'Statement[1].Condition.NumericLessThan s3:max-keys' },
  { message: 'Found data type object allowed type(s) are string', path: 'Statement[1].Condition.StringLike.s3:authType' }
]
*/
```

### Validate Specific Policy Types

There are functions to validate specific policy types, these do all of the general policy validation and additional checks for the specific policy type. For instance Service Control Policies only allow the Condition element when the Effect is Deny.

- `validateIdentityPolicy(policy: any): ValidationError[]`
- `validateServiceControlPolicy(policy: any): ValidationError[]`
- `validateResourcePolicy(policy: any): ValidationError[]`
- `validateTrustPolicy(policy: any): ValidationError[]`
- `validateResourceControlPolicy(policy: any): ValidationError[]`
- `validateEndpointPolicy(policy: any): ValidationError[]`
- `validateSessionPolicy(policy: any): ValidationError[]`

## IAM Policy Parsing and Processing with `loadPolicy`

`loadPolicy` _**does not validate policies**_, if you want validation ahead of time use `validatePolicySyntax`.

### Normalizes Policy Elements that are Objects/Array of Objects or String/Array of Strings

```typescript
import { loadPolicy } from '@cloud-copilot/iam-policy'

//Statement can be an array of objects
const policyOne = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'ArrayStatement',
      Effect: 'Allow',
      Action: ['s3:GetObject'],
      Resource: 'arn:aws:s3:::government-secrets/*'
    }
  ]
}

//Statement can also be a single object
const policyTwo = {
  Version: '2012-10-17',
  Statement: {
    Sid: 'ObjectStatement',
    Effect: 'Allow',
    Action: ['s3:GetObject'],
    Resource: 'arn:aws:s3:::government-secrets/*'
  }
}

//In both cases you can use the `statements` function to get an array of statements
const p1 = loadPolicy(policyOne)
const p2 = loadPolicy(policyTwo)
console.log(p1.statements()[0].sid()) //ArrayStatement
console.log(p2.statements()[0].sid()) //ObjectStatement
```

There is similar support for condition values, principals, and resources.

### Mutually Exclusive or Optional Policy Elements

In IAM policies there are some elements that are mutually exclusive. For example, you can't have a `Principal` and a `NotPrincipal` in the same statement. Some elements are completely optional. We leverage the Typescript type system to make sure you only access data that is confirmed to exist in the policy.

```typescript
import{ loadPolicy } from '@cloud-copilot/iam-policy'

const actionPolicy = {
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
    ],
    "Resource": "arn:aws:s3:::government-secrets/*"
  }
};

const p = loadPolicy(actionPolicy);
const statement = p.statements()[0]; // Get the first statement out

statement.actions() // Compile time error because Statement does not the `actions` function

if(statement.isActionStatement()) {
  // Type is narrowed to ActionStatement so `actions` is now available
  statement.actions() /
}

if(statement.isNotActionStatement()) {
  // Will not exectue because the statement does not have a NotAction element
}
```

`isNotActionStatement` checks for the presence of the NotAction element and is not the inverse of `isActionStatement`. It's possible for a statement to return false for both `isActionStatement` and `isNotActionStatement` if both elements are absent in the statement.

There is similar support for `Action`, `NotAction`, `Principal`, `NotPrincipal`, `Resource`, and `NotResource` elements.

### Flatten Complex Structures

Simplifies complex elements by flattening them into an array of homogenous objects. For example the Principal value can be a string or an object; the object values can be strings or arrays of strings. We flatten those into an array of objects similar to what you would define in a terraform policy.

```typescript
import { loadPolicy } from '@cloud-copilot/iam-policy'

const principalPolicy = {
  Version: '2012-10-17',
  Statement: {
    Effect: 'Allow',
    Principal: {
      AWS: ['arn:aws:iam::123456789012:root', 'arn:aws:iam::123456789013:user/FoxMulder'],
      CanonicalUser: '79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be',
      Federated: 'cognito-identity.amazonaws.com'
    },
    Action: ['s3:GetObject'],
    Resource: 'arn:aws:s3:::government-secrets/*'
  }
}

const p = loadPolicy(principalPolicy)

const statement = p.statements()[0] // Get the first statement out
if (statement.isPrincipalStatement()) {
  //Get an array of 4 Principal objects with a type and value
  const principals = statement.principals()
  principals[0].type() //AWS
  principals[0].value() //arn:aws:iam::123456789012:root
  //and so on
  principals[3].type() //Federated
  principals[3].value() //cognito-identity.amazonaws.com
}
```

There is similar flattening for the `Condition` element.

```typescript
import { loadPolicy } from '@cloud-copilot/iam-policy'

const principalPolicy = {
  Version: '2012-10-17',
  Statement: {
    Effect: 'Allow',
    Principal: {
      AWS: 'arn:aws:iam::123456789012:root'
    },
    Action: ['s3:GetObject'],
    Resource: 'arn:aws:s3:::government-secrets/*',
    Condition: {
      StringEquals: {
        's3:prefix': 'home/${aws:username}',
        'aws:PrincipalOrgID': 'o-1234567890'
      },
      StringLike: {
        's3:authType': 'REST*',
        'aws:TagKeys/Foo': ['Bar*', 'Baz*']
      }
    }
  }
}

const p = loadPolicy(principalPolicy)

const statement = p.statements()[0] // Get the first statement out

const conditions = statement.conditions()
conditions[0].operation().value() //StringEquals
conditions[0].conditionKey() //s3:prefix
conditions[0].conditionValues() //[ home/${aws:username} ]
//and so on
conditions[3].operation().value() //StringLike
conditions[3].conditionKey() //aws:TagKeys/Foo
conditions[3].conditionValues() // [Bar*, Baz*]
```
