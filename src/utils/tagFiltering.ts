import { ExtractedFunctionalLocation, PossibleFunctionalLocations } from '@types';
import { Search } from '@equinor/echo-search';
import { extractFunctionalLocation, getInstCode } from '@utils';

/**
 * Returns a promise to validate a string as a tag number.
 */
function createTagValidator(
  location: ExtractedFunctionalLocation,
  instCode?: string
): Promise<ExtractedFunctionalLocation | undefined> {
  return new Promise((resolve, reject) => {
    Search.Tags.getAsync(location.tagNumber)
      .then(function handleTagValidationResponse(validation) {
        console.log('%c⧭', 'color: #731d1d', validation);

        if (validation.isNotFound){
          console.warn(
            `${location.tagNumber} is not valid.`,
            );
            resolve(location);
        } else {          
          console.info(
            `${location.tagNumber} is valid.`,
          );
          resolve(undefined);
        }
      })
      .catch(function handleTagValidationError(reason) {
        // TODO Possible errorboundary target
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
): Promise<ExtractedFunctionalLocation[]> {

  // Split the possible tag number into functional locations.
  const functionalLocations = locations.results.map((l) => extractFunctionalLocation(l));
    const tagValidationTasks = functionalLocations.map((funcLocation) =>
      createTagValidator(funcLocation, getInstCode())
    );
  const tagValidationResults = await Promise.allSettled([...tagValidationTasks]);
  afterSearchCallback();
  
  return tagValidationResults.map((result) => {
    if (result.status === "fulfilled") return result.value;
  }).filter(result => Boolean(result));
}


