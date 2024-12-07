import { describe, expect, it } from "vitest";
import { AnnotationStore } from "./annotations.js";

describe('AnnotationStore', () => {
  it('should store annotations', () => {
    // Given an annotation store
    const annotationStore = new AnnotationStore()

    // When an annotation is added
    annotationStore.addAnnotation('keyA', 'value1')
    annotationStore.addAnnotation('keyA', 'value2')

    // Then the annotations should be stored
    expect(annotationStore.keys()).toEqual(['keyA'])
    expect(annotationStore.values('keyA')).toEqual(['value1', 'value2'])
  })

  it('should return an empty array for a key that does not exist', () => {
    // Given an annotation store
    const annotationStore = new AnnotationStore()

    // When a key is requested that does not exist
    const values = annotationStore.values('missingKey')

    // Then an empty array should be returned
    expect(values).toEqual([])
  })

  describe('hasKey', () => {
    it('should return true if the key exists', () => {
      // Given an annotation store
      const annotationStore = new AnnotationStore()
      annotationStore.addAnnotation('keyA', 'value1')

      // When the key is checked
      const hasKey = annotationStore.hasKey('keyA')

      // Then true should be returned
      expect(hasKey).toBe(true)
    })

    it('should return false if the key does not exist', () => {
      // Given an annotation store
      const annotationStore = new AnnotationStore()

      // When a nonexistent key is checked
      const hasKey = annotationStore.hasKey('missingKey')

      // Then false should be returned
      expect(hasKey).toBe(false)
    })
  })
})