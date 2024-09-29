# IAM Policy Parser

This is a simple IAM policy library that allows you parse and navigate IAM policies without worring about the more difficult details of parsing policies.

This may be updated in the future to allow modifying policies, right now it's read-only.

_**This does not validate policies**_, it only parses them. If you pass in totally invalid JSON it will fail in glorious and unpredictable ways.

Here are some ways it helps:

## Normalizing Policy Elements that are Objects/Array of Objects or String/Array of Strings
```typescript
import{ loadPolicy } from '@cloud-copilot/iam-policy'

//Statement can be an array of objects
const policyOne = {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ArrayStatement",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
      ],
      "Resource": "arn:aws:s3:::government-secrets/*"
    }
  ]
};

//Statement can also be a single object
const policyTwo = {
  "Version": "2012-10-17",
  "Statement": {
    "Sid": "ObjectStatement",
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
    ],
    "Resource": "arn:aws:s3:::government-secrets/*"
  }
};

//In both cases you can use the `statements` function to get an array of statements
const p1 = loadPolicy(policyOne);
const p2 = loadPolicy(policyTwo);
console.log(p1.statements()[0].sid()); //ArrayStatement
console.log(p2.statements()[0].sid()); //ObjectStatement
```

There is similar support for condition values, principals, and resources.

## Mutually Exclusive or Optional Policy Elements

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

## Flatten Complex Structures

Simplifies complex elements by flattening them into an array of homogenous objects. For example the Principal value can be a string or an object; the object values can be strings or arrays of strings.  We flatten those into an array of objects similar to what you would define in a terraform policy.

```typescript
import{ loadPolicy } from '@cloud-copilot/iam-policy'

const principalPolicy = {
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Principal": {
      "AWS": [
        "arn:aws:iam::123456789012:root",
        "arn:aws:iam::123456789013:user/FoxMulder"
      ],
      "CanonicalUser": "79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be",
      "Federated": "cognito-identity.amazonaws.com"
    },
    "Action": [
      "s3:GetObject",
    ],
    "Resource": "arn:aws:s3:::government-secrets/*"
  }
};

const p = loadPolicy(principalPolicy);

const statement = p.statements()[0]; // Get the first statement out
if(statement.isPrincipalStatement()) {
  //Get an array of 4 Principal objects with a type and value
  const principals = statement.principals();
  principals[0].type() //AWS
  principals[0].value() //arn:aws:iam::123456789012:root
  //and so on
  principals[3].type() //Federated
  principals[3].value() //cognito-identity.amazonaws.com
}
```

There is similar flattening for the `Condition` element.

```typescript
import{ loadPolicy } from '@cloud-copilot/iam-policy'

const principalPolicy = {
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:root",
    },
    "Action": [
      "s3:GetObject",
    ],
    "Resource": "arn:aws:s3:::government-secrets/*",
    "Condition": {
      "StringEquals": {
        "s3:prefix": "home/${aws:username}",
        "aws:PrincipalOrgID": "o-1234567890"
      },
      "StringLike": {
        "s3:authType": "REST*",
        "aws:TagKeys/Foo": ["Bar*", "Baz*"]
      }
    }
  }
};

const p = loadPolicy(principalPolicy);

const statement = p.statements()[0]; // Get the first statement out

const conditions = statement.conditions();
conditions[0].operation().value() //StringEquals
conditions[0].conditionKey() //s3:prefix
conditions[0].conditionValues() //[ home/${aws:username} ]
//and so on
conditions[3].operation().value() //StringLike
conditions[3].conditionKey() //aws:TagKeys/Foo
conditions[3].conditionValues() // [Bar*, Baz*]
```
