export type OCRPayload = {
  /** The ID of a single scan attempt */
  id: string;

  /** The tag number which was returned from OCR after filtering */
  readText: string;

  /** The validated tag number */
  validatedText?: string;

  isSuccess: boolean;
};

export type DeviceUsage = {
  cameraResolution: string;
  deviceOrientation: 'portrait' | 'landscape';
  zoomMethod: 'native' | 'simulated';
  zoomValue: number;
};

export type DeviceInformation = {
  operatingSystem: string;
  webBrowser: string;
  deviceModel: string;
};

export type ScanAttemptLogEntry = OCRPayload & DeviceUsage & DeviceInformation;
