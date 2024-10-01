import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { describe, expect, it } from "vitest";
import { validatePolicySyntax, ValidationError } from "./validate.js";

function getAllFiles(dir: string, allFiles: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively read directory
      getAllFiles(filePath, allFiles);
    } else {
      // Add file to the list
      allFiles.push(filePath);
    }
  });

  return allFiles;
};

// const readAllFilesInDirectory = (directory: string) => {
//   const files = readFilesRecursively(directory);

//   files.forEach((file) => {
//     const content = fs.readFileSync(file, 'utf-8');
//     console.log(`Content of ${file}:`);
//     console.log(content);
//   });
// };

function sortErrors(errors: ValidationError[]): ValidationError[] {
  return errors.sort((a, b) => {
    if (a.path < b.path) {
      return -1;
    } else if (a.path > b.path) {
      return 1;
    } else if(a.message < b.message) {
      return -1;
    } else if(a.message > b.message) {
      return 1;
    }

    return 0;
  });
}

describe('valdiatePolicySyntax', () => {
  const testFolderPath = resolve(join(__dirname, 'validateTests'))
  const allFiles = getAllFiles(testFolderPath);

  for(const testFile of allFiles) {
    const relativePath = testFile.replace(testFolderPath, '').slice(1);
    describe(relativePath, () => {
      const content = readFileSync(testFile, 'utf-8');
      const testCases = JSON.parse(content);
      for(const testCase of testCases) {
        it(testCase.name, () => {
          const errors = validatePolicySyntax(testCase.policy);
          expect(sortErrors(errors)).toEqual(sortErrors(testCase.expectedErrors));
        });
      }
    })
    console.log('testFile', testFile)

  }

  it('should return no errors if the policy is valid', () => {
    //Given a policy:
    const policy = {
      "Version": "2012-10-17",
      "Statement": {
        "Effect": "Allow",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::examplebucket/*"
      }
    }

    //When the policy is validated
    const errors = validatePolicySyntax(policy)

    //Then no errors should be returned
    expect(errors).toEqual([])

  })
})