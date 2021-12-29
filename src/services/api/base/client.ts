import type { HttpResponse, ResponseParser, RequestMethod } from '@types';
import { BaseApiClientError, BaseApiClientRequestFailedError, BaseApiParseError } from './error';
import EchoCore from '@equinor/echo-core';

/**
 * BASE API CLIENT
 */

const requestsInProgress: {
  [key: string]: Promise<HttpResponse<unknown>>;
} = {};

function getRequestInProgress<T>(url: string): Promise<HttpResponse<T>> {
  return requestsInProgress[url] as Promise<HttpResponse<T>>;
}
async function performReusableRequest<T>(
  url: string,
  handler: () => Promise<HttpResponse<T>>
): Promise<HttpResponse<T>> {
  const requestInProgress = getRequestInProgress<T>(url);
  if (requestInProgress) {
    return requestInProgress;
  }

  async function requestPerformer() {
    try {
      const data = await handler();
      delete requestsInProgress[url];
      return data;
    } catch (error) {
      delete requestsInProgress[url];
      throw error;
    }
  }

  const request = requestPerformer();

  requestsInProgress[url] = request;

  return request;
}

async function performFetchAsync<TError>(url: string, init: RequestInit): Promise<Response> {
  const [method, options, body, abortSignal] = await transformRequestAsync(init);

  try {
    const response = await EchoCore.EchoClient.fetch(url, options, method, body, abortSignal);

    if (!response.ok) {
      const errorResponse = await parseResponseJSONAsync<TError>(response);
      throw new BaseApiClientRequestFailedError(url, response.status, errorResponse);
    }

    return response;
  } catch (error) {
    if (error instanceof BaseApiClientRequestFailedError) {
      throw error;
    }

    //@ts-ignore
    throw new BaseApiClientError(error);
  }
}

function ensureRequestInit(
  init?: RequestInit,
  transform?: (init: RequestInit) => RequestInit
): RequestInit {
  const headers = new Headers();

  for (const key in defaultHeaders) {
    headers.append(key, defaultHeaders[key]);
  }

  if (init?.headers) {
    const overriddenHeaders = new Headers(init.headers);
    for (const overriddenHeader of overriddenHeaders) {
      headers.set(overriddenHeader[0], overriddenHeader[1]);
    }
  }

  init = {
    ...init,
    headers
  };

  return transform ? transform(init) : init;
}

const defaultHeaders: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

async function transformRequestAsync(
  init: RequestInit
): Promise<
  [
    RequestMethod,
    Record<string, unknown> | undefined,
    BodyInit | undefined,
    AbortSignal | undefined
  ]
> {
  // Echo adds authHeader for us so we don't need to as long as we use their client.
  const headerOptions: Record<string, unknown> = {};

  // unwrapping into headersoptions plain object for echo usage.
  const initheader = new Headers(init.headers);
  for (const header of initheader) {
    headerOptions[header[0]] = header[1];
  }

  return [
    (init.method as RequestMethod) ?? 'GET',
    headerOptions,
    init.body ?? undefined,
    init.signal ?? undefined
  ];
}

async function parseResponseAsync<T>(
  response: Response,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  try {
    const data = responseParser
      ? await responseParser(response)
      : await parseResponseJSONAsync<T>(response);

    return createHttpResponse<T>(response, data);
  } catch (error) {
    throw new BaseApiParseError(response);
  }
}

function createHttpResponse<T>(response: Response, data: T): HttpResponse<T> {
  const httpResponse: HttpResponse<T> = {
    data,
    status: response.status,
    headers: response.headers
  };

  return httpResponse;
}

async function parseResponseJSONAsync<T>(response: Response): Promise<T> {
  const text = await response.text();

  // For empty response (f.eks. 204 No content)
  if (!text) {
    return {} as T;
  }

  const json: T = JSON.parse(text);
  return json;
}

const Client = {
  createHttpResponse,
  ensureRequestInit,
  getRequestInProgress,
  parseResponseAsync,
  parseResponseJSONAsync,
  performFetchAsync,
  performReusableRequest,
  requestsInProgress,
  transformRequestAsync
};

export { Client };
