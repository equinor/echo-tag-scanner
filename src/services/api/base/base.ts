import type { HttpResponse, ResponseParser } from '@types';
import { Client } from './client';

/**
 *
 * @param {string} url The request URL
 * @param init
 * @param responseParser
 * @returns
 */
async function getAsync<T, TError = never>(
  url: string,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  return Client.performReusableRequest<T>(url, async () => {
    init = Client.ensureRequestInit(init, (init) => ({
      ...init,
      method: 'GET'
    }));
    const response = await Client.performFetchAsync<TError>(url, init);
    const data = await Client.parseResponseAsync<T>(response, responseParser);
    return data;
  });
}
/**
 * OTHERS
 */
async function postAsync<T, TError = never>(
  url: string,
  body: BodyInit,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'POST',
    body
  }));
  const response = await Client.performFetchAsync<TError>(url, init);
  return Client.parseResponseAsync<T>(response, responseParser);
}

async function putAsync<T, TError = never>(
  url: string,
  body: BodyInit,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'PUT',
    body
  }));
  const response = await Client.performFetchAsync<TError>(url, init);
  return Client.parseResponseAsync(response, responseParser);
}

async function patchAsync<T, TError = never>(
  url: string,
  body: BodyInit,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'PATCH',
    body
  }));
  const response = await Client.performFetchAsync<TError>(url, init);
  return Client.parseResponseAsync<T>(response, responseParser);
}

async function deleteAsync<T, TError = never>(
  url: string,
  init?: RequestInit,
  responseParser?: ResponseParser<T>
): Promise<HttpResponse<T>> {
  init = Client.ensureRequestInit(init, (init) => ({
    ...init,
    method: 'DELETE'
  }));
  const response = await Client.performFetchAsync<TError>(url, init);
  return Client.parseResponseAsync<T>(response, responseParser);
}

export const baseApiClient = {
  getAsync,
  postAsync,
  putAsync,
  patchAsync,
  deleteAsync
};
