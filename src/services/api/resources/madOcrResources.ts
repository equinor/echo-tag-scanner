import { parseParams, addParams } from '@utils';

function getHealthResources(): string {
  return 'https://api.gateway.equinor.com/om-functional-locations-ocr/V2.0/health';
}

function getPotentialFunctionalLocationsResources(saveImage: boolean): string {
  let baseUrl = 'https://api.gateway.equinor.com/om-functional-locations-ocr/V2.0/ocr/tags';

  // Will probably be used later.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = parseParams<{ instCode?: string }>(globalThis.location.search);
  baseUrl = addParams(baseUrl, { saveImage });
  /** TODO: Find out how to represent instCode as an integer */
  return baseUrl;
}

export { getHealthResources, getPotentialFunctionalLocationsResources };
