import { EchoEnv } from '@equinor/echo-core';

export function getComputerVisionOcrResources(
  capture: Blob
): [url: string, body: Blob, requestInit: RequestInit] {
  let url = `${EchoEnv.env().REACT_APP_API_URL}/tag-scanner/scan-image`;
  const requestInit: RequestInit = {
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  };

  return [url, capture, requestInit];
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
