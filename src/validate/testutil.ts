import { ValidationError } from './validate.js'

export function sortErrors(errors: ValidationError[]): ValidationError[] {
  return errors.sort((a, b) => {
    if (a.path < b.path) {
      return -1
    } else if (a.path > b.path) {
      return 1
    } else if (a.message < b.message) {
      return -1
    } else if (a.message > b.message) {
      return 1
    }

    return 0
  })
}
