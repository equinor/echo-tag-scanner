export type ErrorRecord = {
  key: ErrorKey;
  severity: 'low' | 'high';
  userMessage: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IErrorRegistry {
  ocrError: ErrorRecord;
  ocrMimeError: ErrorRecord;
  viewfinderError: ErrorRecord;
  zoomError: ErrorRecord;
  torchError: ErrorRecord;
}

export enum ErrorKey {
  EchoCameraApiError = 'Echo_Camera_API_ERROR',
  EchoCameraRuntimeErrors = 'Echo_Camera_Runtime_ERROR'
}

const ErrorMessages = {
  ocrError: {
    generic: 'Something went wrong with tag detection.',
    mimeType:
      'The image you captured could not be analyzed because it appears to have an invalid format.'
  },
  viewfinder: 'Could not find the viewfinder.',
  zoom: 'Something went wrong when we tried to zoom the camera.',
  torch: 'Something went wrong when we tried to turn on the lights'
};

export const ErrorRegistry: IErrorRegistry = {
  ocrError: {
    key: ErrorKey.EchoCameraApiError,
    severity: 'high',
    userMessage: ErrorMessages.ocrError.generic
  },
  ocrMimeError: {
    key: ErrorKey.EchoCameraApiError,
    severity: 'low',
    userMessage: ErrorMessages.ocrError.mimeType
  },
  viewfinderError: {
    key: ErrorKey.EchoCameraRuntimeErrors,
    severity: 'high',
    userMessage: ErrorMessages.viewfinder
  },
  zoomError: {
    key: ErrorKey.EchoCameraRuntimeErrors,
    severity: 'low',
    userMessage: ErrorMessages.zoom
  },
  torchError: {
    key: ErrorKey.EchoCameraRuntimeErrors,
    severity: 'low',
    userMessage: ErrorMessages.torch
  }
} as const;
