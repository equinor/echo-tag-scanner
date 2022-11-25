import { DeviceInformation } from '@utils';

export interface CameraProps {
  mediaStream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
  scanningArea: HTMLElement;
  deviceInformation: DeviceInformation;
}

export type CameraResolution = {
  width?: number;
  height?: number;
  fps?: number;
  zoomLevel?: ZoomSteps;
};

export type CameraResolutionRequest = {
  width: { min: number; max: number };
  height: { min: number; max: number };
  fps?: number;
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
