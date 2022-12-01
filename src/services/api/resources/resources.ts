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
  const computerVisionOcrEndpointDev: EndpointInfo = {
    url: 'https://cv-echotagscanner-dev.cognitiveservices.azure.com/vision/v3.2/ocr',
    apiKey: [
      'a2059f2013384252afd314c10f3a5a50',
      '10541f1b2cfa461fa84b51dc2c256f4b'
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
    language: 'en',
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
