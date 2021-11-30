export type ErrorRecord = {
  key: ErrorKey;
  severity: 'low' | 'high';
  userMessage: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IErrorRegistry {
  ocrError: ErrorRecord;
}

export enum ErrorKey {
  EchoCameraApiError = 'Echo_Camera_API_ERROR'
}

const ErrorMessages = {
  ocrError: 'Something went wrong with tag detection'
};

export const ErrorRegistry: IErrorRegistry = {
  ocrError: {
    key: ErrorKey.EchoCameraApiError,
    severity: 'high',
    userMessage: ErrorMessages.ocrError
  }
} as const;
