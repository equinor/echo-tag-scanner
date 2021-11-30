import BaseResources from '../base/resources';

import { combineUrls, parseParams } from '@utils';

export function getFunctionalLocationsResources(
  image: Blob,
  providedInstCode?: string
): { url: string; body: FormData } {
  const instCode = parseInstCode(providedInstCode);
  const url = combineUrls(BaseResources.baseApiUrl, instCode, 'ocr', 'get-tags');
  const formData = new FormData();
  formData.append('image', image);

  return {
    url,
    body: formData
  };
}

function parseInstCode(providedInstCode?: string): string {
  const params = parseParams<{ instCode?: string }>(globalThis.location.search);
  const instCode = providedInstCode ?? params.instCode;

  if (!instCode) {
    throw new Error('No instcode was provided or was found in url params.');
  }

  return instCode;
}

export default {
  getFunctionalLocationsResources
};
