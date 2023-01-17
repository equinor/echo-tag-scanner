export type OCRPayload = {
  /** The ID of a single scan attempt */
  id: string;

  /** The tag number which was returned from OCR after filtering */
  readText: string;

  /** The validated tag number */
  validatedText?: string;

  /** The time validation took in milliseconds. */
  timeTaken: number;

  isSuccess: boolean;
};

export type DeviceUsage = {
  cameraResolution: string;
  deviceOrientation: 'portrait' | 'landscape';
  zoomMethod: 'native' | 'simulated';
  zoomValue: number;
};
export type WorkingPlatforms =
  | 'Android'
  | 'Linux'
  | 'MacOs'
  | 'iOS'
  | 'iPadOS'
  | 'Windows';

export type DeviceInformation = {
  operatingSystem: string;
  webBrowser: string;
  deviceModel: string;
  platform?: WorkingPlatforms;
};

export type Timers = {
  networkRequestTimeTaken: number;
  OCRPostprocessingTimeTaken: number;
  validationTimeTaken: number;
};

export type ScanAttemptLogEntry = {
  deviceUsage: DeviceUsage;
  deviceInformation: DeviceInformation;
  ocrPayload?: OCRPayload;
  timers?: Timers;
};

/** Represents a "flattened" ScanAttemptLogEntry. */
export type FlatScanAttemptLogEntry =
  | (DeviceUsage & DeviceInformation)
  | OCRPayload
  | Timers;
