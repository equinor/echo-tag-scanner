import { getComputerVisionOcrResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ComputerVisionResponse, ParsedComputerVisionResponse } from '@types';
import { handleError, logger } from '@utils';
import { ErrorRegistry } from '../../../enums';
import { BackendError } from '@equinor/echo-base';

export async function ocrRead(
  image: Blob
): Promise<ParsedComputerVisionResponse> {
  const [url, body, init] = getComputerVisionOcrResources(image);
  try {
    const beforeRequestTimestamp = new Date();
    const response = await baseApiClient.postAsync<ComputerVisionResponse>(
      url,
      body,
      init
    );
    const afterRequestTimestamp = new Date();
    reportTimeTakenForRequest(beforeRequestTimestamp, afterRequestTimestamp);

    const parsedResponse = parseResponse(response.data);
    return parsedResponse;
  } catch (error) {
    if (error instanceof BackendError && error.httpStatusCode === 429) {
      // Here we handle the event where users might go over the Computer vision usage quota.
      // We do not percieve this as an error on the client side. The user will simply try again.
      logger.log('EchoDevelopment', () =>
        console.warn(
          'The scan operation resulted in an overload in the usage quota for Computer Vision. This is normally not a problem and we simply return empty results to the users. This will prompt them to try again.'
        )
      );
      return [];
    } else {
      logger.log('QA', () => console.error('API Error -> ', error));
      throw handleError(ErrorRegistry.ocrError, error as Error);
    }
  }
}

function reportTimeTakenForRequest(startDate: Date, endDate: Date) {
  const result = endDate.getMilliseconds() - startDate.getMilliseconds();
  logger.log('QA', () => {
    console.group('Request timer');
    console.info(`OCR Scanning took ${result} milliseconds`);
    console.groupEnd();
  });
}

// TODO: Improve this, possibly do validation here.
function parseResponse(
  response: ComputerVisionResponse
): ParsedComputerVisionResponse {
  const possibleTagNumbers: string[] = [];
  response.regions.forEach((region) =>
    region.lines.forEach((line) =>
      line.words.forEach((word) => {
        if (word.text && word.text.length >= 5) {
          possibleTagNumbers.push(word.text);
        }
      })
    )
  );
  return possibleTagNumbers;
}
