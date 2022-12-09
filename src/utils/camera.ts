import { Camera } from '@cameraLogic';
import {
  getNotificationDispatcher as dispatchNotification,
  isLocalDevelopment
} from '@utils';
import { CameraSettingsRequest, ZoomMethod } from '@types';
import { fixedCameraSettingsRequest } from '@const';

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

function determineZoomMethod(this: Camera): ZoomMethod {
  // Device has native support.
  if (this.capabilities?.zoom) {
    // Ensure the max zoom is not above 3.
    const maxZoom =
      this.capabilities?.zoom.max > 3 ? 3 : this.capabilities?.zoom.max;
    return {
      type: 'native',
      min: 1,
      max: maxZoom
    } as ZoomMethod;

    // Device does not have native support, fall back to simulated zoom.
  } else {
    return {
      type: 'simulated',
      min: 1,
      max: 2
    } as ZoomMethod;
  }
}

function getCameraPreferences(): MediaStreamConstraints {
  const cameraSettingsRequest = {
    ...fixedCameraSettingsRequest
  };

  // Developer enviroment on desktop. maxTouchPoints can be 1 with touch emulation.
  if (isLocalDevelopment && navigator.maxTouchPoints <= 1) {
    console.info('Creating dev camera request');
    let overrideWidthDev = cameraSettingsRequest.width.exact;
    let overrideHeightDev = cameraSettingsRequest.height.exact;

    const cameraId =
      'a874c50ce1a7f877e5d365c7ef7738d4881d76a22876cd61f0b708422936dc45';

    const request = {
      video: {
        width: { exact: overrideWidthDev },
        height: {
          exact: overrideHeightDev
        },

        // Higher FPS is good for a scanning operation.
        frameRate: { ideal: cameraSettingsRequest.fps?.ideal },

        deviceId: {
          exact: cameraId
        }
      },
      audio: false
    } as MediaStreamConstraints;

    return request;
  }

  // Developer environment on a mobile device.
  if (isLocalDevelopment && navigator.maxTouchPoints > 1) {
    console.info('Creating mobile dev capture request.');
    let overrideWidthDev = cameraSettingsRequest.width.exact;
    let overrideHeightDev = cameraSettingsRequest.height.exact;

    return {
      video: {
        width: { exact: overrideWidthDev },
        height: {
          exact: overrideHeightDev
        },

        // Higher FPS is good for a scanning operation.
        frameRate: { ideal: cameraSettingsRequest.fps?.ideal },

        // Ensures the rear-facing camera is used.
        facingMode: { exact: 'environment' }
      },
      audio: false
    } as MediaStreamConstraints;
  }

  // This is the default preferences, which is also used in production.
  return {
    video: {
      width: {
        exact: cameraSettingsRequest.width.exact
      },
      height: {
        exact: cameraSettingsRequest.height.exact
      },

      // Higher FPS is good for a scanning operation.
      frameRate: {
        ideal: cameraSettingsRequest.fps?.ideal
      },

      facingMode: { ideal: 'environment' }
    },
    audio: false
  } as MediaStreamConstraints;
}

export {
  assignZoomSettings,
  getTorchToggleProvider,
  determineZoomMethod,
  getCameraPreferences
};
