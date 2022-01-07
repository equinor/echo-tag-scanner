import { ExtractedFunctionalLocation, MadOCRFunctionalLocations } from '@types';
import { ResultValue, Search } from '@equinor/echo-search';
import { extractFunctionalLocation, getInstCode } from '@utils';
import { getSelectedPlant } from '@equinor/echo-core';

/**
 * Validates a tag number. If the tag is validated, it is resolved. Otherwise, undefined is resolved.
 */
function createTagValidationAttempt(
  location: ExtractedFunctionalLocation,
  instCode?: string
): Promise<ExtractedFunctionalLocation | undefined> {
  return new Promise((resolve, reject) => {
    console.log('possible tag number:', location);
    Search.Tags.isTagAsync(location.tagNumber, instCode)
      .then(function handleTagValidationResponse(res) {
        if (res.value === true) {
          console.log('found tag number', location.tagNumber);
          resolve(location);
        } else {
          resolve(undefined);
        }
      })
      .catch(function handleTagValidationError(reason) {
        // TODO Possible errorboundary target
        reject(reason);
      });
  });
}

function getFunctionalLocations(locations: MadOCRFunctionalLocations) {
  return locations.results.map((l) => extractFunctionalLocation(l));
}

function filterUnvalidatedLocations(
  res: Array<ExtractedFunctionalLocation | undefined>
) {
  return res.filter((r) => Boolean(r));
}

/**
 * The user might have scanned images containing other things than tag-numbers.
 * This function will filter them out.
 */
export function filterFalsePositives(
  locations: MadOCRFunctionalLocations
): Promise<ExtractedFunctionalLocation[]> {
  return new Promise((resolve) => {
    const functionalLocations = getFunctionalLocations(locations);
    const validationAttempts = functionalLocations.map((funcLocation) =>
      createTagValidationAttempt(funcLocation, getInstCode())
    );

    Promise.all([...validationAttempts]).then((results) => {
      console.log('done, resolving result');
      resolve(filterUnvalidatedLocations(results));
    });
  });
}
