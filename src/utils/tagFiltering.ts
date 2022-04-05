import { ExtractedFunctionalLocation, MadOCRFunctionalLocations } from '@types';
import { ResultValue, Search, TagSummaryDto } from '@equinor/echo-search';
import { extractFunctionalLocation, getInstCode } from '@utils';
import { getSelectedPlant } from '@equinor/echo-core';
import {
  getNotificationDispatcher as dispatchNotification,
} from '@utils';

/**
 * Returns a promise to return a TagSummary, or undefined if no tags were found.
 */
function createTagSearch(
  location: ExtractedFunctionalLocation,
  instCode?: string
): Promise<TagSummaryDto | undefined> {
  return new Promise(function getTag(resolve, reject) {
    Search.Tags.searchAsync(location.tagNumber, 1, instCode)
      .then(function handleTagValidationResponse(tagSummary) {
        console.group('Looking up tag number: ', location.tagNumber);
        console.info('Lookup result: ', tagSummary.values);
        console.groupEnd();
        if (tagSummary.values.length === 1) {
          resolve(tagSummary.values[0]);
        } else {
          resolve(undefined);
        }
      })
      .catch(function handleTagValidationError(reason) {
        console.log('%c⧭', 'color: #994d75', reason);
        // TODO Possible errorboundary target
        reject(reason);
      });
  });
}

function getFunctionalLocations(locations: MadOCRFunctionalLocations) {
  return locations.results.map((l) => extractFunctionalLocation(l));
}

/**
 * Filters away falsey tag results for prior tag searches.
 */
function filterInvalidTags(res: Array<TagSummaryDto | undefined>) {
  return res.filter((r) => Boolean(r));
}

/**
 * The user might have scanned images containing other things than tag-numbers.
 * This function will filter them out.
 */
export function tagSearch(
  locations: MadOCRFunctionalLocations,
  afterSearchCallback: () => void
): Promise<TagSummaryDto[]> {
  return new Promise((resolve) => {
    const functionalLocations = getFunctionalLocations(locations);
    console.log('%c⧭', 'color: #00258c', functionalLocations);
    const tagSearches = functionalLocations.map((funcLocation) =>
      createTagSearch(funcLocation, getInstCode() ?? 'TROA')
    );

    Promise.all([...tagSearches]).then((results) => {
      afterSearchCallback();
      resolve(filterInvalidTags(results));
    });
  });
}
