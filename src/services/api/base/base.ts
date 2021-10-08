import type { HttpResponse, ResponseParser } from './types';

import Client from './client';
/**
 * GET Handling
 */
async function getAsync<T, TError = unknown>(
  url: string,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  return Client.performReusableRequest<T>(url, async () => {
    init = Client.ensureRequestInit(init, (init) => ({ ...init, method: 'GET' }));

    const response = await Client.performFetchAsync<TError>(url, init);
    const data = await Client.parseResponseAsync<T>(response, responseParser);
    return data;
  });
}
/**
 * OTHERS
 */
async function postAsync<T, TBody extends unknown = unknown, TError = unknown>(
  url: string,
  body: TBody,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'POST',
    body: Client.createRequestBody(body)
  }));
  const response = await Client.performFetchAsync<TError>(url, init);
  return Client.parseResponseAsync<T>(response, responseParser);
}
async function putAsync<T, TBody extends unknown = unknown, TError = unknown>(
  url: string,
  body: TBody,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'PUT',
    body: Client.createRequestBody(body)
  }));

  const response = await Client.performFetchAsync<TError>(url, init);
  return Client.parseResponseAsync(response, responseParser);
}

async function patchAsync<T, TBody extends unknown = unknown, TError = unknown>(
  url: string,
  body: TBody,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'PATCH',
    body: Client.createRequestBody(body)
  }));

  const response = await Client.performFetchAsync<TError>(url, init);

  return Client.parseResponseAsync<T>(response, responseParser);
}

async function deleteAsync<T, TBody extends unknown = unknown, TError = unknown>(
  url: string,
  body?: TBody,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'DELETE',
    body: Client.createRequestBody(body)
  }));

  const response = await Client.performFetchAsync<TError>(url, init);

  return Client.parseResponseAsync<T>(response, responseParser);
}

export default {
  getAsync,
  postAsync,
  putAsync,
  patchAsync,
  deleteAsync
};
