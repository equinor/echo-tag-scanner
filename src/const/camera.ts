import { CameraSettingsRequest } from '@types';

export const zoomSteps = [1, 2, 3];
Reflect.preventExtensions(zoomSteps);

export const fixedCameraSettingsRequest: CameraSettingsRequest = {
  width: { exact: 1280 },
  height: { exact: 720 },

  /** The FPS can be considered ideal, but will drop lower if the device is not capable.
   * Defaults to 60.
   */
  fps: { ideal: 60 }
};
Reflect.preventExtensions(fixedCameraSettingsRequest);
