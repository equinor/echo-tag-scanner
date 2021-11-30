import { baseApiClient } from '../base/base';

/**
 * Relays an image for OCR.
 * @returns a list of functional locations.
 */
export async function getFunctionalTagLocations(image: Blob): Promise<string[]> {
  // TODO: Handle QA and prod environments
  const url = 'https://dt-echopedia-api-dev.azurewebsites.net/ocr/get-tags';
  const body = new FormData();
  body.append('image', image);
  const response = await baseApiClient.postAsync<string[]>(url, body);
  return response.data;
}
