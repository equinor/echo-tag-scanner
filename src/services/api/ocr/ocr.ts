import { getFunctionalLocationsResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ErrorRegistry } from '@enums';
import { handleError } from '@utils';

export async function getFunctionalLocations(image: Blob): Promise<unknown> {
  try {
    const { url, body } = getFunctionalLocationsResources(image);
    return await baseApiClient.postAsync(url, body);
  } catch (error) {
    throw handleError(ErrorRegistry.ocrError, error);
  }
}

export const ocrApi = { getFunctionalLocations };
