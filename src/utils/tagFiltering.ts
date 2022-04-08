import { ExtractedFunctionalLocation, MadOCRFunctionalLocations } from '@types';
import { Search, TagSummaryDto } from '@equinor/echo-search';
import { extractFunctionalLocation, getInstCode } from '@utils';

/**
 * Returns a promise to return a TagSummary, or undefined if no tags were found.
 */
function createTagSearch(
  location: ExtractedFunctionalLocation,
  instCode?: string
): Promise<ExtractedFunctionalLocation | undefined> {
  return new Promise((resolve, reject) => {
    Search.Tags.isTagAsync(location.tagNumber, instCode)
      .then(function handleTagValidationResponse(validation) {
        if (Boolean(validation.value)) {
          console.info(
            `${location.tagNumber} is valid: `,
            Boolean(validation.value)
          );
        } else {
          console.warn(
            `${location.tagNumber} is valid: `,
            Boolean(validation.value)
          );
        }

        if (validation.value) {
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

/**
 * The user might have scanned images containing other things than tag-numbers.
 * This function will filter them out.
 */
export function tagSearch(
  locations: MadOCRFunctionalLocations,
  afterSearchCallback: () => void
): Promise<ExtractedFunctionalLocation[]> {
  return new Promise((resolve) => {
    const functionalLocations = getFunctionalLocations(locations);
    const tagSearches = functionalLocations.map((funcLocation) =>
      createTagSearch(funcLocation, getInstCode() ?? 'TROA')
    );

    Promise.all([...tagSearches]).then((results) => {
      afterSearchCallback();

      // Resolve a list of validated tags and filter away undefines.
      resolve(results.filter((r) => Boolean(r)));
    });
  });
}
