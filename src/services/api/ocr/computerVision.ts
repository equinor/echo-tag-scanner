import { getComputerVisionOcrResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ComputerVisionResponse, ParsedComputerVisionResponse } from '@types';

export async function ocrRead(image: Blob): Promise<ParsedComputerVisionResponse> {
  const [url, body, init] = getComputerVisionOcrResources(image);
  try {
    const response = await baseApiClient.postAsync<ComputerVisionResponse>(
        url,
        body,
        init
        );
      const parsedResponse = parseResponse(response.data);
      console.log(parsedResponse);
      return parsedResponse;
  } catch (e) {
  }
}

// TODO: Improve this, possibly do validation here.
function parseResponse(
  response: ComputerVisionResponse
): ParsedComputerVisionResponse {
  const possibleTagNumbers = [];
  response.regions.forEach((region) =>
    region.lines.forEach((line) =>
      line.words.forEach((word) => {
        if (word.text && word.text.length > 7) {
            // TODO: Improve regexp to include filter everything expect "-", alphanumerics, and aA-zZ.
              possibleTagNumbers.push(word.text.replaceAll(/[\(\)']+/g, ''));
        }
      })
    )
  );
  console.log("ocr result: ", possibleTagNumbers);
  return { results: possibleTagNumbers };
}
