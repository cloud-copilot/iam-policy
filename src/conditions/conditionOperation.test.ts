import { describe, expect, it } from "vitest";
import { ConditionOperationImpl } from "./conditionOperation.js";


describe("ConditionOperationImpl", () => {
  describe("value", () => {
    it("should return the raw string of the condition operation", () => {
      //Given a condition operation
      const conditionOp = new ConditionOperationImpl('StringNotEqualsIfExists')

      //When value is called
      const result = conditionOp.value()

      //Then the raw string of the condition operation is returned
      expect(result).toBe('StringNotEqualsIfExists')
    })
  })

  describe("isIfExists", () => {
    it("should return true if the condition operation ends with IfExists", () => {
      //Given a condition operation that ends with IfExists
      const conditionOp = new ConditionOperationImpl('StringNotEqualsIfExists')

      //When isIfExists is called
      const result = conditionOp.isIfExists()

      //Then true is returned
      expect(result).toBe(true)
    })

    it('should be case insensitive', () => {
      //Given a condition operation that ends with IfExists in a different case
      const conditionOp = new ConditionOperationImpl('StringNotEqualsIFEXISTS')

      //When isIfExists is called
      const result = conditionOp.isIfExists()

      //Then true is returned
      expect(result).toBe(true)
    })

    it("should return false if the condition operation does not end with IfExists", () => {
      //Given a condition operation that does not end with IfExists
      const conditionOp = new ConditionOperationImpl('StringNotEquals')

      //When isIfExists is called
      const result = conditionOp.isIfExists()

      //Then false is returned
      expect(result).toBe(false)
    })
  })

  describe('setOperator', () => {
    it('should return the set operator if present', () => {
      //Given a condition operation with a set operator
      const conditionOp = new ConditionOperationImpl('ForAllValues:StringNotEqualsIfExists')

      //When setOperator is called
      const result = conditionOp.setOperator()

      //Then the set operator is returned
      expect(result).toBe('ForAllValues')
    })

    it('should return undefined if the set operator is not present', () => {
      //Given a condition operation without a set operator
      const conditionOp = new ConditionOperationImpl('StringNotEqualsIfExists')

      //When setOperator is called
      const result = conditionOp.setOperator()

      //Then undefined is returned
      expect(result).toBe(undefined)
    })

    it('should be case insensitive', () => {
      //Given a condition operation with a set operator in a different case
      const conditionOp = new ConditionOperationImpl('FORALLVALUES:StringNotEqualsIfExists')

      //When setOperator is called
      const result = conditionOp.setOperator()

      //Then the set operator is returned
      expect(result).toBe('ForAllValues')
    })
  })

  describe('baseOperator', () => {
    it('should return the original value if the operation has no modifiers', () => {
      //Given a condition operation without modifiers
      const conditionOp = new ConditionOperationImpl('StringNotEquals')

      //When baseOperator is called
      const result = conditionOp.baseOperator()

      //Then the original value is returned
      expect(result).toBe('StringNotEquals')
    })

    it('should return the base operator without the set modifier', () => {
      //Given a condition operation with a set modifier
      const conditionOp = new ConditionOperationImpl('ForAllValues:StringNotEquals')

      //When baseOperator is called
      const result = conditionOp.baseOperator()

      //Then the base operator without the set modifier is returned
      expect(result).toBe('StringNotEquals')
    })

    it('should return the base operator without the IfExists modifier', () => {
      //Given a condition operation with the IfExists modifier
      const conditionOp = new ConditionOperationImpl('StringNotEqualsIfExists')

      //When baseOperator is called
      const result = conditionOp.baseOperator()

      //Then the base operator without the IfExists modifier is returned
      expect(result).toBe('StringNotEquals')
    })

    it('should return the base operator without the set modifier and IfExists', () => {
      //Given a condition operation with the set modifier and IfExists
      const conditionOp = new ConditionOperationImpl('ForAllValues:StringNotEqualsIfExists')

      //When baseOperator is called
      const result = conditionOp.baseOperator()

      //Then the base operator without the set modifier and IfExists is returned
      expect(result).toBe('StringNotEquals')
    })

    it('should be case insensitive', () => {
      //Given a condition operation with the IfExists modifier in a different case
      const conditionOp = new ConditionOperationImpl('StringNotEqualsIFEXISTS')

      //When baseOperator is called
      const result = conditionOp.baseOperator()

      //Then the base operator without the IfExists modifier is returned
      expect(result).toBe('StringNotEquals')
    })
  })
})