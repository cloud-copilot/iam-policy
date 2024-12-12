export type PrincipalType = 'AWS' | 'Service' | 'Federated' | 'CanonicalUser'

/**
 * A Principal in a policy statement
 */
export interface Principal {
  /**
   * The type of principal, such as "AWS", "Service", "Federated", "CanonicalUser"
   */
  type(): PrincipalType

  /**
   * The raw string of the principal
   */
  value(): string

  /**
   * Whether the principal is a wildcard principal: `"*"`
   */
  isWildcardPrincipal(): this is WildcardPrincipal

  /**
   * Whether the principal is an AWS principal
   */
  isServicePrincipal(): this is ServicePrincipal

  /**
   * Whether the principal is an AWS principal that is not an account or wildcard principal
   */
  isAwsPrincipal(): this is AwsPrincipal

  /**
   * Whether the principal is a unique id principal
   */
  isUniqueIdPrincipal(): this is UniqueIdPrincipal

  /**
   * Whether the principal is a federated principal
   */
  isFederatedPrincipal(): this is FederatedPrincipal

  /**
   * Whether the principal is a canonical user principal
   */
  isCanonicalUserPrincipal(): this is CanonicalUserPrincipal

  /**
   * Whether the principal is an account principal
   */
  isAccountPrincipal(): this is AccountPrincipal
}

/**
 * A wildcard principal: `"*"`
 */
export interface WildcardPrincipal extends Principal {
  /**
   * The wildcard character `"*"`, this exists to differentiate between this interface and the Principal interface
   */
  wildcard(): '*'
}

/**
 * An AWS principal: `"arn:aws:iam::account-id:root"` or a 12 digit account id
 */
export interface AccountPrincipal extends Principal {
  /**
   * The 12 digit account id of the principal
   */
  accountId(): string
}

/**
 * An AWS principal this is an ARN that is not an account or wildcard principal
 */
export interface AwsPrincipal extends Principal {
  arn(): string
}

/**
 * An AWS principal that is a unique Id
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_identifiers.html#identifiers-unique-ids
 */
export interface UniqueIdPrincipal extends Principal {
  uniqueId(): string
}

/**
 * An AWS principal that is a service principal: `"service"`
 */
export interface ServicePrincipal extends Principal {
  /**
   * The service the principal represents
   */
  service(): string
}

/**
 * A federated principal
 */
export interface FederatedPrincipal extends Principal {
  /**
   * The id of the federated principal
   */
  federated(): string
}

/**
 * A canonical user principal
 */
export interface CanonicalUserPrincipal extends Principal {
  /**
   * The canonical user id of the principal
   */
  canonicalUser(): string
}

const accountIdRegex = /^[0-9]{12}$/
const accountArnRegex = /^arn:.*?:iam::[0-9]{12}:root$/
const uniqueIdRegex = /^A[0-9A-Z]+$/

export class PrincipalImpl
  implements
    Principal,
    WildcardPrincipal,
    AccountPrincipal,
    UniqueIdPrincipal,
    AwsPrincipal,
    ServicePrincipal,
    FederatedPrincipal,
    CanonicalUserPrincipal
{
  constructor(
    private readonly principalType: PrincipalType,
    private readonly principalId: string
  ) {}

  public value(): string {
    return this.principalId
  }

  public type(): PrincipalType {
    return this.principalType
  }

  public isWildcardPrincipal(): this is WildcardPrincipal {
    return this.principalType === 'AWS' && this.principalId === '*'
  }

  public isAccountPrincipal(): this is AccountPrincipal {
    if (this.principalType !== 'AWS') {
      return false
    }
    return accountIdRegex.test(this.principalId) || accountArnRegex.test(this.principalId)
  }

  public isUniqueIdPrincipal(): this is UniqueIdPrincipal {
    if (this.principalType !== 'AWS') {
      return false
    }
    return uniqueIdRegex.test(this.principalId)
  }

  public isAwsPrincipal(): this is AwsPrincipal {
    if (this.principalType !== 'AWS') {
      return false
    }
    const anyThis: any = this
    return (
      anyThis.principalId != '*' && !anyThis.isAccountPrincipal() && !anyThis.isUniqueIdPrincipal()
    )
  }

  public isServicePrincipal(): this is ServicePrincipal {
    return this.principalType === 'Service'
  }

  public isFederatedPrincipal(): this is FederatedPrincipal {
    return this.principalType === 'Federated'
  }

  public isCanonicalUserPrincipal(): this is CanonicalUserPrincipal {
    return this.principalType === 'CanonicalUser'
  }

  public wildcard(): '*' {
    if (!this.isWildcardPrincipal()) {
      throw new Error(
        'Principal is not a wildcard principal, call isWildcardPrincipal() before calling wildcard()'
      )
    }
    return '*'
  }

  public accountId(): string {
    if (!this.isAccountPrincipal()) {
      throw new Error(
        'Principal is not an account principal, call isAccountPrincipal() before calling accountId()'
      )
    }
    if (accountArnRegex.test(this.principalId)) {
      return this.principalId.split(':')[4]
    }
    return this.principalId
  }

  public uniqueId(): string {
    if (!this.isUniqueIdPrincipal()) {
      throw new Error(
        'Principal is not a unique id principal, call isUniqueIdPrincipal() before calling uniqueId()'
      )
    }
    return this.principalId
  }

  public arn(): string {
    if (!this.isAwsPrincipal()) {
      throw new Error(
        'Principal is not an AWS principal, call isAwsPrincipal() before calling arn()'
      )
    }
    return this.principalId
  }

  public service(): string {
    if (!this.isServicePrincipal()) {
      throw new Error(
        'Principal is not a service principal, call isServicePrincipal() before calling service()'
      )
    }
    return this.principalId
  }

  public federated(): string {
    if (this.principalType !== 'Federated') {
      throw new Error(
        'Principal is not a federated principal, call isFederatedPrincipal() before calling federated()'
      )
    }
    return this.principalId
  }

  public canonicalUser(): string {
    if (this.principalType !== 'CanonicalUser') {
      throw new Error(
        'Principal is not a canonical user principal, call isCanonicalUserPrincipal() before calling canonicalUser()'
      )
    }
    return this.principalId
  }
}
