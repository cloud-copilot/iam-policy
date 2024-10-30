import { describe, expect, it } from "vitest";
import { PrincipalImpl } from "./principal.js";

describe("Principal", () => {
  it('returns the values of the principal', () => {
    //Given a principal type and id
    const principalType = "AWS";
    const principalId = "123456789012";

    //When the principal is created
    const principal = new PrincipalImpl(principalType, principalId);

    //Then the principal type and id are returned
    expect(principal.type()).toBe(principalType);
    expect(principal.value()).toBe(principalId);
  })

  describe('isWildcardPrincipal', () => {
    it('returns true if the principal is a wildcard principal', () => {
      //Given a wildcard principal
      const principal = new PrincipalImpl('AWS', '*');

      //When the principal is checked
      const isWildcardPrincipal = principal.isWildcardPrincipal();

      //Then the principal is a wildcard principal
      expect(isWildcardPrincipal).toBe(true);
    })

    it('returns false if the principal is not a wildcard principal', () => {
      //Given a non-wildcard principal
      const principal = new PrincipalImpl('AWS', '123456789012');

      //When the principal is checked
      const isWildcardPrincipal = principal.isWildcardPrincipal();

      //Then the principal is not a wildcard principal
      expect(isWildcardPrincipal).toBe(false);
    })

    it('returns the wildcard value', () => {
      //Given a wildcard principal
      const principal = new PrincipalImpl('AWS', '*');

      //When the wildcard value is requested
      const wildcard = principal.wildcard();

      //Then the wildcard value is returned
      expect(wildcard).toBe('*');
    })

    it('throws an error if the principal is not a wildcard principal', () => {
      //Given a non-wildcard principal
      const principal = new PrincipalImpl('Federated', 'actions.github.com');

      //When the wildcard value is requested
      const getWildcard = () => principal.wildcard();

      //Then an error is thrown
      expect(getWildcard).toThrowError('Principal is not a wildcard principal, call isWildcardPrincipal() before calling wildcard()');
    })
  })


  describe('isAccountPrincipal', () => {
    it('returns true if the principal is an account id', () => {
      //Given an account principal
      const principal = new PrincipalImpl('AWS', '123456789012');

      //When the principal is checked
      const isAccountPrincipal = principal.isAccountPrincipal();

      //Then the principal is an account principal
      expect(isAccountPrincipal).toBe(true);
    })

    it('returns true if the principal is an account ARN', () => {
      //Given an account ARN principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::123456789012:root');

      //When the principal is checked
      const isAccountPrincipal = principal.isAccountPrincipal();

      //Then the principal is an account principal
      expect(isAccountPrincipal).toBe(true);
    })

    it('returns the true for an account arn with a different partition', () => {
      //Given an account ARN principal with a different partition
      const principal = new PrincipalImpl('AWS', 'arn:aws-cn:iam::987654321098:root');

      //When the principal is checked
      const isAccountPrincipal = principal.isAccountPrincipal();

      //Then the principal is an account principal
      expect(isAccountPrincipal).toBe(true);
    })

    it('returns false if the principal is not an AWS principal', () => {
      //Given a non-AWS principal
      const principal = new PrincipalImpl('Service', 's3.amazonaws.com');

      //When the principal is checked
      const isAccountPrincipal = principal.isAccountPrincipal();

      //Then the principal is not an account principal
      expect(isAccountPrincipal).toBe(false);
    })

    it('returns false for an arn that is not an account arn', () => {

      //Given a non-account ARN principal
      const principal = new PrincipalImpl('AWS', 'arn:s3:::my_corporate_bucket');

      //When the principal is checked
      const isAccountPrincipal = principal.isAccountPrincipal();

      //Then the principal is not an account principal
      expect(isAccountPrincipal).toBe(false);
    })
  })

  describe('accountId', () => {

    it('returns the account id of the principal', () => {
      //Given an account principal
      const principal = new PrincipalImpl('AWS', '123456789012');

      //When the account id is requested
      const accountId = principal.accountId();

      //Then the account id is returned
      expect(accountId).toBe('123456789012');
    })

    it('returns the account id of the principal from an ARN', () => {
      //Given an account ARN principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::492856294826:root');

      //When the account id is requested
      const accountId = principal.accountId();

      //Then the account id is returned

      expect(accountId).toBe('492856294826');
    })

    it('should throw an error if the principal is not an account principal', () => {
      //Given a non-account principal
      const principal = new PrincipalImpl('AWS', 'actions.github.com');

      //When the account id is requested
      const getAccountId = () => principal.accountId();

      //Then an error is thrown
      expect(getAccountId).toThrowError('Principal is not an account principal, call isAccountPrincipal() before calling accountId()');
    })
  })

  describe('isUniqueIdPrincipal', () => {
    it('returns true if the principal is a unique id', () => {
      //Given a unique id principal
      const principal = new PrincipalImpl('AWS', 'AIDACKCEVSQ6C2EXAMPLE')

      //When the principal is checked
      const isUniqueIdPrincipal = principal.isUniqueIdPrincipal();

      //Then the principal is a unique id principal
      expect(isUniqueIdPrincipal).toBe(true);
    })
    it('returns false if the principal is not a unique id', () => {
      //Given a non-unique id principal
      const principal = new PrincipalImpl('CanonicalUser', 'arn:aws:iam::user/MrShow');

      //When the principal is checked
      const isUniqueIdPrincipal = principal.isUniqueIdPrincipal();

      //Then the principal is not a unique id principal
      expect(isUniqueIdPrincipal).toBe(false);
    })
  })

  describe('uniqueId', () => {
    it('returns the unique id of the principal', () => {
      //Given a unique id principal
      const principal = new PrincipalImpl('AWS', 'AIDACKCEVSQ6C2EXAMPLE');

      //When the unique id is requested
      const uniqueId = principal.uniqueId();

      //Then the unique id is returned
      expect(uniqueId).toBe('AIDACKCEVSQ6C2EXAMPLE');
    })

    it('should throw an error if the principal is not a unique id principal', () => {
      //Given a non-unique id principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/MrShow');

      //When the unique id is requested
      const getUniqueId = () => principal.uniqueId();

      //Then an error is thrown
      expect(getUniqueId).toThrowError('Principal is not a unique id principal, call isUniqueIdPrincipal() before calling uniqueId()');
    })
  })

  describe('isAwsPrincipal', () => {
    it('returns true if the principal is an AWS principal', () => {
      //Given an AWS principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/MrShow');

      //When the principal is checked
      const isAwsPrincipal = principal.isAwsPrincipal();

      //Then the principal is an AWS principal
      expect(isAwsPrincipal).toBe(true);
    })

    it('returns false if the principal is a wildcard principal', () => {
      //Given a wildcard principal
      const principal = new PrincipalImpl('AWS', '*');

      //When the principal is checked
      const isAwsPrincipal = principal.isAwsPrincipal();

      //Then the principal is not an AWS principal
      expect(isAwsPrincipal).toBe(false);
    })

    it('returns false for an account principal', () => {
      //Given an account principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::492856294826:root');

      //When the principal is checked
      const isAwsPrincipal = principal.isAwsPrincipal();

      //Then the principal is not an AWS principal
      expect(isAwsPrincipal).toBe(false);
    })

    it('return false for a service principal', () => {
      //Given a service principal
      const principal = new PrincipalImpl('Service', 'arn:aws:iam::user/MrShow');

      //When the principal is checked
      const isAwsPrincipal = principal.isAwsPrincipal();

      //Then the principal is not an AWS principal
      expect(isAwsPrincipal).toBe(false);
    })
  })

  describe('arn', () => {
    it('returns the ARN of the principal', () => {
      //Given an AWS principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Bob');

      //When the ARN is requested
      const arn = principal.arn();

      //Then the ARN is returned
      expect(arn).toBe('arn:aws:iam::user/Bob')
    })

    it('should throw an error if the principal is not an AWS principal', () => {
      //Given a non-AWS principal
      const principal = new PrincipalImpl('Service', 's3.amazonaws.com');

      //When the ARN is requested
      const getArn = () => principal.arn();

      //Then an error is thrown
      expect(getArn).toThrowError('Principal is not an AWS principal, call isAwsPrincipal() before calling arn()');
    })
  })

  describe('isServicePrincipal', () => {
    it('returns true if the principal is a service principal', () => {
      //Given a service principal
      const principal = new PrincipalImpl('Service', 's3.amazonaws.com');

      //When the principal is checked
      const isServicePrincipal = principal.isServicePrincipal();

      //Then the principal is a service principal
      expect(isServicePrincipal).toBe(true);
    })

    it('returns false if the principal is not a service principal', () => {
      //Given a non-service principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Bob');

      //When the principal is checked
      const isServicePrincipal = principal.isServicePrincipal();

      //Then the principal is not a service principal
      expect(isServicePrincipal).toBe(false);
    })
  })

  describe('service', () => {
    it('returns the service of the principal', () => {
      //Given a service principal
      const principal = new PrincipalImpl('Service', 's3.amazonaws.com');

      //When the service is requested
      const service = principal.service();

      //Then the service is returned
      expect(service).toBe('s3.amazonaws.com');
    })

    it('should throw an error if the principal is not a service principal', () => {
      //Given a non-service principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Dave');

      //When the service is requested
      const getService = () => principal.service();

      //Then an error is thrown
      expect(getService).toThrowError('Principal is not a service principal, call isServicePrincipal() before calling service()');
    })
  })

  describe('isFederatedPrincipal', () => {
    it('returns true if the principal is a federated principal', () => {
      //Given a federated principal
      const principal = new PrincipalImpl('Federated', 'actions.github.com');

      //When the principal is checked
      const isFederatedPrincipal = principal.isFederatedPrincipal();

      //Then the principal is a federated principal
      expect(isFederatedPrincipal).toBe(true);
    })

    it('returns false if the principal is not a federated principal', () => {
      //Given a non-federated principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Steve');

      //When the principal is checked
      const isFederatedPrincipal = principal.isFederatedPrincipal();

      //Then the principal is not a federated principal
      expect(isFederatedPrincipal).toBe(false);
    })
  })

  describe('federated', () => {
    it('returns the federated value of the principal', () => {
      //Given a federated principal
      const principal = new PrincipalImpl('Federated', 'actions.github.com');

      //When the federated value is requested
      const federated = principal.federated();

      //Then the federated value is returned
      expect(federated).toBe('actions.github.com');
    })

    it('should throw an error if the principal is not a federated principal', () => {
      //Given a non-federated principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Steve');

      //When the federated value is requested
      const getFederated = () => principal.federated();

      //Then an error is thrown
      expect(getFederated).toThrowError('Principal is not a federated principal, call isFederatedPrincipal() before calling federated()');
    })
  })

  describe('isCanonicalUserPrincipal', () => {
    it('returns true if the principal is a canonical user principal', () => {
      //Given a canonical user principal
      const principal = new PrincipalImpl('CanonicalUser', '79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be');

      //When the principal is checked
      const isCanonicalUserPrincipal = principal.isCanonicalUserPrincipal();

      //Then the principal is a canonical user principal
      expect(isCanonicalUserPrincipal).toBe(true);
    })

    it('returns false if the principal is not a canonical user principal', () => {
      //Given a non-canonical user principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Ringo');

      //When the principal is checked
      const isCanonicalUserPrincipal = principal.isCanonicalUserPrincipal();

      //Then the principal is not a canonical user principal
      expect(isCanonicalUserPrincipal).toBe(false);
    })
  })

  describe('canonicalUser', () => {
    it('returns the canonical user value of the principal', () => {
      //Given a canonical user principal
      const principal = new PrincipalImpl('CanonicalUser', '79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be');

      //When the canonical user value is requested
      const canonicalUser = principal.canonicalUser();

      //Then the canonical user value is returned
      expect(canonicalUser).toBe('79a59df900b949e55d96a1e698fbacedfd6e09d98eacf8f8d5218e7cd47ef2be');
    })

    it('should throw an error if the principal is not a canonical user principal', () => {
      //Given a non-canonical user principal
      const principal = new PrincipalImpl('AWS', 'arn:aws:iam::user/Ringo');

      //When the canonical user value is requested
      const getCanonicalUser = () => principal.canonicalUser();

      //Then an error is thrown
      expect(getCanonicalUser).toThrowError('Principal is not a canonical user principal, call isCanonicalUserPrincipal() before calling canonicalUser()');
    })
  })
})