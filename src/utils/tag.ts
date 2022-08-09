import { ParsedComputerVisionResponse } from '@types';
import { Search, TagSummaryDto } from '@equinor/echo-search';
import { logger } from './logger';

function hasContent(data: unknown) {
  if (data != null) {
    if (typeof data === 'string' || typeof data === 'number') {
      return data != null;
    } else if (Array.isArray(data)) {
      return data.length > 0;
    } else if (typeof data === 'object') {
      return Reflect.ownKeys(data).length > 0;
    }
  }
  return false;
}

/**
 * Accepts a possible tag number as string value and runs it through Echo Search for validation.
 */
async function findClosestTag(possibleTagNumber: string) {
  const result = await Search.Tags.closestTagAsync(possibleTagNumber);
  if (result.isSuccess) {
    logger.log('Info', () => {
      console.group('Running validation for ', possibleTagNumber);
      console.info(possibleTagNumber + ' corrected to ' + result.value);
      console.groupEnd();
    });
    return result.value;
  }
}

/**
 * Accepts a validated tag and fetches its tag summary locally.
 */
async function getTagSummary(validationResult: string): Promise<TagSummaryDto> {
  return new Promise((resolve, reject) => {
    Search.Tags.getAsync(validationResult).then((result) => {
      if (result.isSuccess && result.value != null) {
        resolve(result.value);
      } else {
        reject(result.value);
      }
    });
  });
}

/**
 * Returns a promise to validate a string as a tag number.
 */
async function createTagValidator(
  possibleTagNumber: string
): Promise<TagSummaryDto> {
  return new Promise((resolve, reject) => {
    findClosestTag(possibleTagNumber).then((closestTagMatch) => {
      if (closestTagMatch) resolve(getTagSummary(closestTagMatch));
      else reject(closestTagMatch);
    });
  });
}

/**
 * The user might have scanned images containing other things than tag-numbers.
 * This function handles the filtering of these false positives.
 */
export async function runTagValidation(
  locations: ParsedComputerVisionResponse
): Promise<TagSummaryDto[]> {
  const tagValidationTasks = locations.map((funcLocation) =>
    createTagValidator(funcLocation)
  );
  const tagValidationResults = await Promise.allSettled([
    ...tagValidationTasks
  ]);
  const unwrapped: TagSummaryDto[] = [];
  tagValidationResults.forEach((res) => {
    if (res.status === 'fulfilled') unwrapped.push(res.value);
  });

  return unwrapped;
}
