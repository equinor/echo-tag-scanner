import BaseResources from '../base/resources';

import { combineUrls } from '@utils';

export function getFunctionalLocationsResources(image: Blob): {
  url: string;
  body: Blob;
  init: RequestInit;
} {
  const boundary = `------------------------------${Math.random().toString(36).substring(2)}`;

  // request url
  const url = combineUrls(BaseResources.baseApiUrl, 'ocr', 'get-tags');

  //headers
  const init: RequestInit = {
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` }
  };

  return {
    url,
    body: createBlob(image, boundary),
    init
  };
}

function createBlob(imageBlob: Blob, boundary: string) {
  const appendingMeta = `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="ocr_img.JPG"\r\nContent-Type: image/jpeg\r\n\r\n`;
  const prependingMeta = `\r\n--${boundary}--`;
  return new Blob([appendingMeta, imageBlob, prependingMeta]);
}

export default {
  getFunctionalLocationsResources
};
