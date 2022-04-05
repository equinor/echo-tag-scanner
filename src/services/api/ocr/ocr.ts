import { getFunctionalLocationsResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ErrorRegistry } from '@enums';
import { handleError } from '@utils';
import { MadOCRFunctionalLocations } from '@types';

export async function getFunctionalLocations(image: Blob): Promise<MadOCRFunctionalLocations> {
  try {
    const { url, body, init } = getFunctionalLocationsResources(image);
    return (await baseApiClient.postAsync<MadOCRFunctionalLocations>(url, body, init)).data;
  } catch (error) {
    throw handleError(ErrorRegistry.ocrError, error as Error);
  }
}
export const ocrApi = { getFunctionalLocations };
