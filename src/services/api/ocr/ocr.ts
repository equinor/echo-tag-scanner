import { getFunctionalLocationsResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ErrorRegistry } from '@enums';
import { handleError } from '@utils';
import { MadOCRFunctionalLocations } from '@types';

export async function getFunctionalLocations(image: Blob): Promise<MadOCRFunctionalLocations> {
  try {
    const beforeRequestTimestamp = new Date();
    const { url, body, init } = getFunctionalLocationsResources(image);
    const result = await baseApiClient.postAsync<MadOCRFunctionalLocations>(
      url,
      body,
      init
    );
    const afterRequestTimestamp = new Date();
    reportTimeTakenForRequest(beforeRequestTimestamp, afterRequestTimestamp);
    return result.data;
  } catch (error) {
    throw handleError(ErrorRegistry.ocrError, error as Error);
  }
}
export const ocrApi = { getFunctionalLocations };

function reportTimeTakenForRequest(startDate: Date, endDate: Date) {
  const result = endDate.getSeconds() - startDate.getSeconds();
  console.group('Request timer');
  console.info(`Request took -> ${result} seconds`);
}
