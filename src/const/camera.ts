import { CameraResolution } from '@types';

export const zoomSteps = [1, 2, 3];
Reflect.preventExtensions(zoomSteps);

export const staticResolution: CameraResolution = {
  width: 1280,
  height: 720,
  fps: 60,
  zoomLevel: undefined
};
Reflect.preventExtensions(staticResolution);
