export type HttpResponse<T> = {
  status: number;
  headers: Headers;
  data: T;
};
export type ResponseParser<T> = (response: Response) => Promise<T>;

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
