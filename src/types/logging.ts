export type OCRPayload = Pick<
  ScanAttempt,
  'id' | 'isSuccess' | 'readText' | 'validatedText'
>;

export type DeviceUsage = Pick<
  ScanAttempt,
  'cameraResolution' | 'deviceOrientation' | 'zoomValue' | 'zoomMethod'
>;

export type ScanAttempt = {
  /** The ID of a single scan attempt */
  id: string;

  /** The tag number which was returned from OCR after filtering */
  readText: string;

  /** The validated tag number */
  validatedText?: string;

  /** The current zoom value as the scanning attempt happened. */
  zoomValue: number;

  isSuccess: boolean;
  cameraResolution: string;
  deviceOrientation: 'portrait' | 'landscape';
  zoomMethod: 'native' | 'simulated';
};
