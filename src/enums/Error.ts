export type ErrorRecord = {
  key: ErrorKey;
  severity: 'low' | 'high';
  userMessage: string;
};
export interface IErrorRegistry {
  ocrError: ErrorRecord;
  ocrMimeError: ErrorRecord;
  viewfinderError: ErrorRecord;
  zoomError: ErrorRecord;
  torchError: ErrorRecord;
  overconstrainedError: ErrorRecord;
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
  torch: 'Something went wrong when we tried to turn on the lights',
  OverconstrainedError:
    'The camera failed to start due to device dimensions. The viewport dimension must be 720x1280 or 1280x720'
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
  },
  overconstrainedError: {
    key: ErrorKey.EchoCameraRuntimeErrors,
    severity: 'high',
    userMessage: ErrorMessages.OverconstrainedError
  }
} as const;
