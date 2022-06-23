import BaseResources from '../base/resources';

import { combineUrls } from '@utils';

export function getFunctionalLocationsResources(image: Blob): {
  url: string;
  body: Blob;
  init: RequestInit;
} {
  const boundary = `------------------------------${Math.random()
    .toString(36)
    .substring(2)}`;

  // request url
  const url = combineUrls(BaseResources.baseApiUrl, 'ocr', 'get-tags');

  //headers
  const init: RequestInit = {
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` }
  };

  function createBlob(imageBlob: Blob, boundary: string) {
    const appendingMeta = `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="ocr_img.JPG"\r\nContent-Type: image/jpeg\r\n\r\n`;
    const prependingMeta = `\r\n--${boundary}--`;
    return new Blob([appendingMeta, imageBlob, prependingMeta]);
  }

  return {
    url,
    body: createBlob(image, boundary),
    init
  };
}

/* --------------- Computer Vision OCR -------------------------------------- */

type EndpointInfo = {
  url: string;
  apiKey: Array<string>;
};
// TODO: Move to env vars.
const computerVisionOcrEndpointDev: EndpointInfo = {
  url: 'https://echocamera-tag-scanner-dev.cognitiveservices.azure.com/vision/v3.2/ocr',
  apiKey: [
    '47a223e8dae44f93ab479f0b49b7005d',
    '5442094e81954068bd0b1a6df5a1c0ad'
  ]
};

type ComputerVisionOcrParams = {
  language: string | 'unk';
  detectOrientation?: boolean;
  modelVersion: string | 'latest';
};

export function getComputerVisionOcrResources(
  image: Blob
): [url: string, body: Blob, requestInit: RequestInit] {
  const body = image;

  let url = computerVisionOcrEndpointDev.url;
  const params: ComputerVisionOcrParams = {
    language: 'unk',
    detectOrientation: false,
    modelVersion: '2022-04-30'
  };
  url = addParams(url, params);

  const init: RequestInit = {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': computerVisionOcrEndpointDev.apiKey[0]
    }
  };

  return [url, body, init];
}

export type Params = { [key: string]: any };
export function addParams(url: string, params: Params): string {
  const queryString = Object.keys(params)
    .filter((key) => params[key])
    .reduce(
      (query, key) =>
        query + `${query ? '&' : ''}${key}=${encodeURIComponent(params[key])}`,
      ''
    );

  if (queryString) {
    return url + '?' + queryString;
  }

  return url;
}

export default {
  getFunctionalLocationsResources
};
