import BaseResources from '../base/resources';

import { combineUrls } from '@utils';
import { EchoEnv } from '@equinor/echo-core';

/* --------------- Computer Vision OCR -------------------------------------- */

type EndpointInfo = {
  url: string;
  apiKey: Array<string>;
};

type ComputerVisionOcrParams = {
  language: string | 'unk';
  detectOrientation?: boolean;
  modelVersion: string | 'latest';
};

function getComputerVisionEndpoint() {
  // TODO: Move sensitive API stuff out + rotate the API keys. Suggested method is Azure functions.
  const computerVisionOcrEndpointDev: EndpointInfo = {
    url: 'https://echocamera-tag-scanner-dev.cognitiveservices.azure.com/vision/v3.2/ocr',
    apiKey: [
      '47a223e8dae44f93ab479f0b49b7005d',
      '5442094e81954068bd0b1a6df5a1c0ad'
    ]
  };

  const computerVisionOcrEndpointProd: EndpointInfo = {
    url: 'https://cv-echotagscanner.cognitiveservices.azure.com/vision/v3.2/ocr',
    apiKey: [
      '38297f4586b141d98838e854c14334bc',
      'c3a36b9c198149b695b77e96ef73f93f'
    ]
  };

  const apiUrl = EchoEnv.env().REACT_APP_API_URL;
  if (apiUrl === 'https://dt-echopedia-api-dev.azurewebsites.net') {
    return computerVisionOcrEndpointDev;
  } else {
    return computerVisionOcrEndpointProd;
  }
}

export function getComputerVisionOcrResources(
  image: Blob
): [url: string, body: Blob, requestInit: RequestInit] {
  const body = image;

  let { url, apiKey } = getComputerVisionEndpoint();
  const params: ComputerVisionOcrParams = {
    language: 'unk',
    detectOrientation: false,
    modelVersion: '2022-04-30'
  };
  url = addParams(url, params);

  const init: RequestInit = {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': apiKey[0]
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
