abstract class BaseApiError extends Error {
  abstract toString(): string;
}

export class BaseApiClientError extends BaseApiError {
  toString(): string {
    return this.message;
  }
}

export class BaseApiClientRequestFailedError<TError> extends BaseApiClientError {
  url: string;
  statusCode: number;
  response: TError;

  constructor(url: string, statusCode: number, response: TError) {
    super(`[${url}] returned status code [${statusCode}] and response [${response}]`);
    this.url = url;
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class BaseApiParseError extends BaseApiClientError {
  response: Response;
  constructor(response: Response) {
    super(`BaseApiClient failed to parse response data`);
    this.response = response;
  }

  toString(): string {
    return `BaseApiClient failed to parse response data ${this.response.text()}`;
  }
}
