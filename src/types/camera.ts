export interface CameraProps {
  mediaStream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

export type PostprocessorProps = Pick<CameraProps, 'canvas'>;

export type CameraResolution = {
  width?: number;
  height?: number;
  fps?: number;
};

/** Refers to the dimensions of the viewfinder. */
export type Dimensions = Pick<CameraResolution, 'width' | 'height'>;

// TODO: Calculate the max zoom modifier
/** Describes the method of zooming for the device.
 * - Native: The camera can leverage MediaStream API to perform digital zoom.
 * - Simulated: The camera will perform zoom by scaling the camera feed.
 */
export type ZoomMethod = {
  type: 'simulated' | 'native';
  min: 1;
  max: number;
};

// TODO: The number of zoom steps will eventually be dynamic and cannot be determined at runtime.
export type ZoomSteps = 1 | 2 | 3;
