import { CameraResolutionRequest } from '@types';

export const zoomSteps = [1, 2, 3];
Reflect.preventExtensions(zoomSteps);

export const cameraRequest: CameraResolutionRequest = {
  width: { min: 1280, max: 1920 },
  height: { min: 720, max: 1080 },

  /** The FPS can be considered ideal, but will drop lower if the device is not capable.
   * Defaults to 60.
   */
  fps: 60
};
Reflect.preventExtensions(cameraRequest);
