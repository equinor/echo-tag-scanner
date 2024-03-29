import { DeviceInformation } from '@types';

export interface CameraProps {
  mediaStream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  additionalCaptureOptions?: MediaStreamConstraints;
  scanningArea: HTMLElement;
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
