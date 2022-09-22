import { Camera } from '@cameraLogic';
import { getNotificationDispatcher as dispatchNotification } from '@utils';
import { ZoomMethod } from '@types';

function assignZoomSettings(
  type: 'min' | 'max' | 'step' | 'value',
  camera: Camera
): string {
  if (type === 'value') {
    if (camera.videoTrackSettings?.zoom) {
      return String(camera.videoTrackSettings.zoom);
    } else {
      return '1';
    }
  }
  if (camera.capabilities?.zoom) {
    if (camera.capabilities.zoom[type]) {
      return String(camera.zoom[type]);
    }
  }
  // If zoom capabilities does not exist, we need to return a stringified zero
  // to prevent a stringified undefined to be assigned to the zoom slider.
  return '0';
}

/**
 * Returns a closure that handles the toggling of the torch functionality.
 */
function getTorchToggleProvider(camera: Camera) {
  return function provideTorchToggling() {
    const onToggleTorch = () => {
      camera.toggleTorch();
    };

    const onToggleUnsupportedTorch = () => {
      dispatchNotification('The torch is not supported on this device.')();
    };

    if (camera.capabilities?.torch) {
      return onToggleTorch();
    } else {
      return onToggleUnsupportedTorch();
    }
  };
}

function determineZoomMethod(this: Camera): ZoomMethod | undefined {
  console.log('%c⧭', 'color: #733d00', this);
  // Device has native support.
  if (this.capabilities?.zoom) {
    return {
      type: 'native',
      min: 1,
      max: this.capabilities?.zoom.max
    } as ZoomMethod;

    // Device does not have native support, but the camera could allow for simulated zoom.
  } else {
    return {
      type: 'simulated',
      min: 1,
      max: 3 // TODO: Find the max zoom value based on max camera resolution.
    } as ZoomMethod;
  }
}

export { assignZoomSettings, getTorchToggleProvider, determineZoomMethod };
