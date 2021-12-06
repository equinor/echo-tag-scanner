import { getFunctionalLocationsResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { isBaseApiError } from '../base/error';
import { ErrorRegistry } from '@enums';
import { handleError } from '@utils';
import { MadOCRFunctionalLocations } from '@types';

export async function getFunctionalLocations(image: Blob): Promise<MadOCRFunctionalLocations> {
  try {
    const { url, body, init } = getFunctionalLocationsResources(image);

    return await (
      await baseApiClient.postAsync<MadOCRFunctionalLocations>(url, body, init)
    ).data;
  } catch (error) {
    if (isBaseApiError(error)) {
      throw handleError(ErrorRegistry.ocrError, error.toString());
    }
    throw handleError(ErrorRegistry.ocrError, error);
  }
}


export const ocrApi = { getFunctionalLocations };
