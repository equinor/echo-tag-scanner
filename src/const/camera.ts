import { CameraSettingsRequest } from '@types';

export const zoomSteps = [1, 2, 3];
Reflect.preventExtensions(zoomSteps);

export const fixedCameraSettingsRequest: CameraSettingsRequest = {
  width: { min: 1280, max: 1280 },
  height: { min: 720, max: 720 },

  /** The FPS can be considered ideal, but will drop lower if the device is not capable.
   * Defaults to 60.
   */
  fps: 60
};
Reflect.preventExtensions(fixedCameraSettingsRequest);
