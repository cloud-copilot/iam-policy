export type PrincipalType = 'AWS' | 'Service' | 'Federated' | 'CanonicalUser'

export interface Principal {
  type(): PrincipalType
  value(): string
}

export class PrincipalImpl {
  constructor(private readonly principalType: PrincipalType, private readonly principalId: string) {}

  public value(): string {
    return this.principalId
  }

  public type(): PrincipalType {
    return this.principalType
  }
}

//AWS
export class AwsPrincipal extends PrincipalImpl {
}

//Service
export class ServicePrincipal extends PrincipalImpl {
}

//Federated
export class FederatedPrincipal extends PrincipalImpl {
}

//CanonicalUser
export class CanonicalUserPrincipal extends PrincipalImpl {
}