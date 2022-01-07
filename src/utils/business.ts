import { ExtractedFunctionalLocation } from '@types';
import { SAP_PLANT_NUMBERS } from '@enums';
import { getSelectedPlant } from '@equinor/echo-core';

/**
 * Splits a functional location into its consecutive parts SAP plant ID and tagnumber.
 */
export function extractFunctionalLocation(
  input: string
): ExtractedFunctionalLocation {
  const parts = input.split('-');
  const extract: ExtractedFunctionalLocation = {
    sapPlantId: undefined,
    tagNumber: undefined
  };

  if (parts.length >= 1) {
    if (isSapPlantId(parts[0])) {
      extract.sapPlantId = parts[0];

      // Remove the SAP Plant ID, before joining the rest of the tag number.
      parts.shift();
    }
    extract.tagNumber = parts.join('-');
  }
  /**
   * Examples:
   * 1340-85-HAA005 (leading SAP plant id)
   * 32-ET300A (leading system prefix, ie no SAP plant id)
   */
  return extract;
}

/**
 * Accepts a string and cross-checks the Sap Plant ID Set in order to determine if it is a valid SAP plant id.
 */
function isSapPlantId(input: string): boolean {
  for (let sapNum of SAP_PLANT_NUMBERS.values()) {
    if (sapNum === Number(input)) {
      return true;
    }
  }
  return false;
}

export function getInstCode(): string | undefined {
  let { instCode } = getSelectedPlant();
  if (!instCode) {
    const urlParams = new URLSearchParams(globalThis.location.search);
    instCode = urlParams.get('instCode');

    if (!instCode) {
      instCode = 'TROA';
    }
  }
  return instCode;
}
