
/**
 * The annotations on a policy element
 */
export interface Annotations {

  /**
   * The string keys that have annotations
   *
   * @returns the keys that have annotations
   */
  keys(): string[]

  /**
   * Get the values for a key
   *
   * @param key the key to get the values for
   * @returns the values for the key or an empty array if the key does not exist
   */
  values(key: string): string[]

  /**
   * Checks if a key is present in the annotations
   *
   * @param key the key to check
   * @returns true if the key is present, false otherwise
   */
  hasKey(key: string): boolean
}

/**
 * A store for policy annotations
 */
export class AnnotationStore implements Annotations{
  private annotations: Record<string, string[]>;
  constructor() {
    this.annotations = {};
  }

  addAnnotation(key: string, value: string) {
    if (!this.annotations[key]) {
      this.annotations[key] = [];
    }
    this.annotations[key].push(value);
  }

  keys(): string[] {
    return Object.keys(this.annotations);
  }

  hasKey(key: string): boolean {
    return this.annotations[key] !== undefined;
  }

  values(key: string): string[] {
    return this.annotations[key] || [];
  }
}

/**
 * Standard methods for an object that can be annotated
 */
export interface Annotated {

  /**
   * Add an annotation to the object
   *
   * @param key the key of the annotation
   * @param value the value of the annotation
   */
  addAnnotation(key: string, value: string): void

  /**
   * Get the annotations on the object
   *
   * @returns the annotations on the object
   */
  getAnnotations(): Annotations
}