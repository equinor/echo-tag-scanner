// within the same "alias";
import BaseApiClient from './base/base';
import {
  getHealthResources,
  getPotentialFunctionalLocationsResources
} from './resources/madOcrResources';

import { MadOCRStatus, MadOCRFunctionalLocations } from '@types';

/**
 * Returns health status for the MadOCR Api.
 * https://api.equinor.com/docs/services/MadOcrApi/operations/GetHealth?
 */
async function getHealth(): Promise<MadOCRStatus> {
  const url = getHealthResources();

  // TODO: Add subscription before sending.
  const response = await BaseApiClient.getAsync<MadOCRStatus>(url);
  return response.data;
}

/**
 * Returns a list of functional locations in the provided image.
 * @param image The raw image.
 * @param saveImage Should the image be stored for ML purposes, default false.
 */
async function postImageForTagRecognition(
  image: unknown,
  saveImage = false
): Promise<MadOCRFunctionalLocations> {
  const url = getPotentialFunctionalLocationsResources(saveImage);

  // TODO: add image to body */
  // TODO: Add subscription before sending. */
  const body = {};
  const response = await BaseApiClient.postAsync<MadOCRFunctionalLocations>(url, body);
  return response.data;
}

export { getHealth, postImageForTagRecognition };
