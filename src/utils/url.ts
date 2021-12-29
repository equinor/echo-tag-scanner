// eslint-disable-next-line @typescript-eslint/no-explicit-any
const separator = '/';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Params = { [key: string]: any };
export function addParams(url: string, params: Params): string {
  const queryString = Object.keys(params)
    .filter((key) => params[key])
    .reduce(
      (query, key) => query + `${query ? '&' : ''}${key}=${encodeURIComponent(params[key])}`,
      ''
    );

  if (queryString) {
    return url + '?' + queryString;
  }

  return url;
}

export function trimLeadingQuestion(url: string): string {
  return url.replace(/^\?/, '');
}

export function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, '');
}

export function parseParams<T extends Record<string, string>>(url: string): T {
  const query = trimLeadingQuestion(url);

  const params: Params = {};
  query.split('&').forEach((param: string) => {
    const [key, value] = param.split('=');
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);

    params[decodedKey] = decodedValue;
  });

  return params as T;
}

export function combineUrls(base: string, ...parts: string[]): string {
  const url = (parts || [])
    .filter((part) => part)
    .reduce((url, part) => url + separator + encodeURIComponent(part), base || '');

  return trimTrailingSlash(url);
}
