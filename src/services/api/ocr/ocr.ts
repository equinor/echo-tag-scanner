import { getFunctionalLocationsResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ErrorRegistry } from '@enums';
import { handleError } from '@utils';
import { PossibleFunctionalLocations } from '@types';

export async function getFunctionalLocations(image: Blob): Promise<PossibleFunctionalLocations> {
  try {
    const beforeRequestTimestamp = new Date();
    const { url, body, init } = getFunctionalLocationsResources(image);
    const result = await baseApiClient.postAsync<PossibleFunctionalLocations>(
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
  const result = endDate.getMilliseconds() - startDate.getMilliseconds();
  console.group('Request timer');
  console.info(`OCR Scanning took ${result} seconds`);
  console.groupEnd();
}
