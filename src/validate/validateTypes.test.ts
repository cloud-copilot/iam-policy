import { readFileSync } from 'node:fs'
import { join, resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { sortErrors } from './testutil.js'
import {
  validateEndpointPolicy,
  validateIdentityPolicy,
  validateResourceControlPolicy,
  validateResourcePolicy,
  validateServiceControlPolicy,
  validateSessionPolicy,
  validateTrustPolicy
} from './validateTypes.js'

const testFolderPath = resolve(join(__dirname, 'validateTypeTests'))

const typesToValidate = [
  { fn: validateIdentityPolicy, testFiles: ['identityPolicy'] },
  { fn: validateServiceControlPolicy, testFiles: ['scp'] },
  { fn: validateResourcePolicy, testFiles: ['resourcePolicy'] },
  { fn: validateResourceControlPolicy, testFiles: ['rcp'] },
  { fn: validateTrustPolicy, testFiles: ['trustPolicy'] },
  { fn: validateEndpointPolicy, testFiles: ['endpointPolicy'] },
  { fn: validateSessionPolicy, testFiles: ['sessionPolicy'] }
]

const pickTest: string | undefined = undefined

for (const testConfig of typesToValidate) {
  describe(testConfig.fn.name, () => {
    const pickTest: string | undefined = undefined

    for (const testFile of testConfig.testFiles) {
      describe(testFile, () => {
        const filePath = join(testFolderPath, testFile + '.json')
        const content = readFileSync(filePath, 'utf-8')
        const testCases = JSON.parse(content)
        for (const testCase of testCases) {
          let testFunc: typeof it | typeof it.only = it
          if (pickTest === testCase.name) {
            testFunc = it.only
          }
          testFunc(testCase.name, () => {
            const errors = testConfig.fn(testCase.policy)
            expect(sortErrors(errors)).toEqual(sortErrors(testCase.expectedErrors))
          })
        }
      })
    }
  })
}
