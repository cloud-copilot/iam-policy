import { describe, expect, it } from "vitest";
import { PolicyImpl } from "./policy.js";

describe("PolicyImpl", () => {
  describe("version", () => {
    it("should return the version", () => {
      // Given a policy object
      const policyObject = {
        Version: "2012-10-17"
      }

      // When a PolicyImpl is created
      const policy = new PolicyImpl(policyObject, false);

      // Then the version should be the version
      expect(policy.version()).toBe(policyObject.Version);
    });
  })

  describe("id", () => {
    it("should return the id", () => {
      // Given a policy object
      const policyObject = {
        Id: "MyPolicy"
      }

      // When a PolicyImpl is created
      const policy = new PolicyImpl(policyObject, false);

      // Then the id should be the id
      expect(policy.id()).toBe(policyObject.Id);
    });
  })

  describe("statements", () => {
    it('should return the statement when there is only one statement', () => {
      // Given a policy object with a single statement in an object
      const policyObject = {
        Statement: {
          Sid: 'Lonely',
          Effect: "Allow",
          Action: "s3:GetObject",
          Resource: "arn:aws:s3:::my_corporate_bucket/*"
        }
      }

      // When a PolicyImpl is created
      const policy = new PolicyImpl(policyObject, false);

      // Then the statements should be an array with one statement
      expect(policy.statements().length).toBe(1);
      expect(policy.statements()[0].sid()).toBe('Lonely');
    })

    it('should return the statements when there are multiple statements', () => {
      // Given a policy object with multiple statements in an array
      const policyObject = {
        Statement: [
          {
            Sid: 'First',
            Effect: "Allow",
            Action: "s3:GetObject",
            Resource: "arn:aws:s3:::my_corporate_bucket/*"
          },
          {
            Sid: 'Second',
            Effect: "Deny",
            Action: "s3:GetObject",
            Resource: "arn:aws:s3:::my_corporate_bucket/secret_plans.txt"
          }
        ]
      }

      // When a PolicyImpl is created
      const policy = new PolicyImpl(policyObject, false);

      // Then the statements should be an array with two statements
      expect(policy.statements().length).toEqual(2);
      expect(policy.statements()[0].sid()).toEqual('First');
      expect(policy.statements()[0].index()).toEqual(1);
      expect(policy.statements()[1].sid()).toEqual('Second');
      expect(policy.statements()[1].index()).toEqual(2);
    })
  })

  describe('statementIsArray', () => {
    it('should return true when the statement is an array', () => {
      // Given a policy object with multiple statements in an array
      const policyObject = {
        Statement: [
          {
            Sid: 'First',
            Effect: "Allow",
            Action: "s3:GetObject",
            Resource: "arn:aws:s3:::my_corporate_bucket/*"
          },
          {
            Sid: 'Second',
            Effect: "Deny",
            Action: "s3:GetObject",
            Resource: "arn:aws:s3:::my_corporate_bucket/secret_plans.txt"
          }
        ]
      }

      // When a PolicyImpl is created
      const policy = new PolicyImpl(policyObject, false);

      // Then the statementIsArray should return true
      expect(policy.statementIsArray()).toBe(true);
    })

    it('should return false when the statement is not an array', () => {
      // Given a policy object with a single statement in an object
      const policyObject = {
        Statement: {
          Sid: 'Lonely',
          Effect: "Allow",
          Action: "s3:GetObject",
          Resource: "arn:aws:s3:::my_corporate_bucket/*"
        }
      }

      // When a PolicyImpl is created
      const policy = new PolicyImpl(policyObject, false);

      // Then the statementIsArray should return false
      expect(policy.statementIsArray()).toBe(false);
    })
  })
})