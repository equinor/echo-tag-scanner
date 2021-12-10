import { ExtractedFunctionalLocation } from '@types';

/**
 * Splits a functional location into its consecutive parts SAP plant ID and tagnumber.
 */
export function extractFunctionalLocation(input: string): ExtractedFunctionalLocation {
  const parts = input.split('-');
  const extract: ExtractedFunctionalLocation = {
    sapPlantId: undefined,
    tagNumber: undefined
  };

  if (parts.length >= 2) {
    if (parts[0] != null) {
      extract.sapPlantId = parts[0];
      // Remove the SAP Plant ID
      parts.shift();

      extract.tagNumber = parts.join('-');
    }
  }

  return extract;
}
