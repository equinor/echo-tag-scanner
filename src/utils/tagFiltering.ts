import {
  ExtractedFunctionalLocation,
  PossibleFunctionalLocations
} from '@types';
import { Search, TagSummaryDto, ResultValue } from '@equinor/echo-search';
import { extractFunctionalLocation, getInstCode } from '@utils';

function hasContent(data: unknown) {
  if (typeof data === 'string' || typeof data === 'number') {
    return data != null;
  } else if (Array.isArray(data)) {
    return data.length > 0;
  } else if (typeof data === 'object') {
    return Reflect.ownKeys(data).length > 0;
  }
}

/**
 * Accepts a possible tag number as string value and runs it through Echo Search for validation.
 */
async function findClosestTag(possibleTagNumber: string) {
  const result = await Search.Tags.closestTagAsync(possibleTagNumber);
  if (result.isSuccess) {
    console.group('Running validation for ', possibleTagNumber);
    console.info(possibleTagNumber + ' corrected to ' + result.value);
    console.groupEnd();
    return result.value;
  }
}

/**
 * Accepts a validated tag and fetches its tag summary locally.
 */
async function getTagSummary(validationResult: string) {
  const result = await Search.Tags.getAsync(validationResult);
  if (result.isSuccess && hasContent(result.value)) return result.value;
}

function tagSummary(tagSummary: TagSummaryDto): TagSummaryDto {
  // TODO: Validate tag summary
  return tagSummary;
}

/**
 * Returns a promise to validate a string as a tag number.
 */
function createTagValidator(
  location: ExtractedFunctionalLocation,
  instCode?: string
): Promise<TagSummaryDto> {
  return new Promise((resolve, reject) => {
    findClosestTag(location.tagNumber)
      .then(getTagSummary)
      .then((summary) => resolve(tagSummary(summary)))
      .catch(function handleTagValidationError(reason) {
        reject(reason);
      });
  });
}

/**
 * The user might have scanned images containing other things than tag-numbers.
 * This function handles the filtering of these false positives.
 */
export async function runTagValidation(
  locations: PossibleFunctionalLocations,
  afterSearchCallback: () => void
): Promise<TagSummaryDto[]> {
  // Split the possible tag number into functional locations.
  const functionalLocations = locations.results.map((l) =>
    extractFunctionalLocation(l)
  );
  const tagValidationTasks = functionalLocations.map((funcLocation) =>
    createTagValidator(funcLocation, getInstCode())
  );
  const tagValidationResults = await Promise.allSettled([
    ...tagValidationTasks
  ]);
  afterSearchCallback();

  return tagValidationResults
    .map((result) => {
      if (result.status === 'fulfilled') return result.value;
    })
    .filter((result) => Boolean(result));
}
