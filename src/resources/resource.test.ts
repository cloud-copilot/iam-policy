import { describe, expect, it } from "vitest";
import { ResourceImpl } from "./resource.js";

describe("ResourceImpl", () => {
  describe("value", () => {
    it("should return the value", () => {
      // Given a resource string
      const resourceString = "arn:aws:s3:::my_corporate_bucket/*";

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString);

      // Then the value should be the resource string
      expect(resource.value()).toBe(resourceString);
    });
  });

  describe("isAllResources", () => {
    it("should return true when all resources", () => {
      // Given a resource wildcard
      const resourceString = "*";

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString);

      // Then the isAllResources should be true
      expect(resource.isAllResources()).toBe(true);
    });

    it("should return false when not all resources", () => {
      // Given a resource string
      const resourceString = "arn:aws:s3:::my_corporate_bucket/*";

      // When a ResourceImpl is created
      const resource = new ResourceImpl(resourceString);

      // Then the isAllResources should be false
      expect(resource.isAllResources()).toBe(false);
    });
  });
})