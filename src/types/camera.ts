import { TagSummaryDto } from '@equinor/echo-search';
import { DeviceInformation } from '@equinor/echo-utils';

import { OCRPayload, ParsedComputerVisionResponse } from '@types';

export interface ScannerProps extends CameraProps {
  ocrService: OCRService;
  scanningArea: HTMLElement;
}

export interface OCRService {
  refreshAttemptId(): Promise<string>;
  runOCR(scan: Blob): Promise<{
    ocrResponse: ParsedComputerVisionResponse;
    networkRequestTimeTaken: number;
    postOCRTimeTaken: number;
  } | null>;
  handleValidation(unvalidatedTags: ParsedComputerVisionResponse): Promise<{
    validatedTags: TagSummaryDto[];
    validationLogEntry?: OCRPayload;
  }>;
}

export interface CameraProps {
  mediaStream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  additionalCaptureOptions?: MediaStreamConstraints;
  deviceInformation: DeviceInformation;
}

export type CameraResolution = {
  width?: number;
  height?: number;
  fps?: number;
  zoomFactor?: number;
};

export type CameraSettingsRequest = {
  width: { exact?: number };
  height: { exact?: number };
  fps?: { exact?: number; ideal?: number };
};

/** Refers to the dimensions of the viewfinder. */
export type ViewfinderDimensions = Pick<CameraResolution, 'width' | 'height'>;

/** Describes the method of zooming for the device.
 * - Native: The camera can leverage MediaStream API to perform digital zoom.
 * - Simulated: The camera will perform zoom by scaling the camera feed.
 */
export type ZoomMethod = {
  type: 'simulated' | 'native';
  min: 1;
  max: number;
};

export type ZoomSteps = 1 | 2 | 3;
