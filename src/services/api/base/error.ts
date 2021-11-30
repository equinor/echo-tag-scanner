abstract class BaseApiError {
  originalError: Error;
  abstract toString(): string;

  constructor(originalError: Error | string) {
    if (typeof originalError === 'string') {
      this.originalError = new Error(originalError);
    } else {
      this.originalError = originalError;
    }
  }
}

export class BaseApiClientError extends BaseApiError {
  toString(): string {
    return this.originalError.message;
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

export function isBaseApiError(error: unknown): boolean {
  if (
    error instanceof BaseApiParseError ||
    error instanceof BaseApiClientRequestFailedError ||
    error instanceof BaseApiError
  ) {
    return true;
  } else {
    return false;
  }
}
