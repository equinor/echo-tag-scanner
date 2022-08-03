import { getComputerVisionOcrResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ComputerVisionResponse, ParsedComputerVisionResponse } from '@types';
import { handleError, logger } from '@utils';
import { ErrorRegistry } from '../../../enums';

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
    logger.log('Error', () => console.error('API Error -> ', error));
    throw handleError(ErrorRegistry.ocrError, error as Error);
  }
}

function reportTimeTakenForRequest(startDate: Date, endDate: Date) {
  const result = endDate.getMilliseconds() - startDate.getMilliseconds();
  logger.log('Info', () => {
    console.group('Request timer');
    console.info(`OCR Scanning took ${result} milliseconds`);
    console.groupEnd();
  });
}

// TODO: Improve this, possibly do validation here.
function parseResponse(
  response: ComputerVisionResponse
): ParsedComputerVisionResponse {
  const possibleTagNumbers = [];
  response.regions.forEach((region) =>
    region.lines.forEach((line) =>
      line.words.forEach((word) => {
        if (word.text && word.text.length >= 7) {
          // TODO: Improve regexp to include filter everything expect "-", alphanumerics, and aA-zZ.
          possibleTagNumbers.push(word.text.replaceAll(/[\(\)']+/g, ''));
        }
      })
    )
  );
  return possibleTagNumbers;
}
