import { Camera } from '@cameraLogic';
import {
  getNotificationDispatcher as dispatchNotification,
  isDevelopment,
  isLocalDevelopment,
  isQA,
  getOrientation
} from '@utils';
import { ZoomMethod } from '@types';
import { cameraRequest } from '../const';
import EchoUtils from '@equinor/echo-utils';

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

function isIosDevice() {}

function getCameraPreferences(): MediaStreamConstraints {
  const isIos = EchoUtils.Utils.iOs.isIosDevice();

  // Developer enviroment, use this for desktop.
  if (isLocalDevelopment && !isIos && navigator.maxTouchPoints === 1) {
    console.info('Creating dev camera request');
    let maxWidthDev = cameraRequest.width.max;
    let maxHeightDev = cameraRequest.height.max;
    let minWidthDev = cameraRequest.width.min;
    let minHeightDev = cameraRequest.height.min;

    const cameraId = undefined;

    const request = {
      video: {
        width: { max: maxWidthDev, min: minWidthDev },
        height: {
          max: maxHeightDev,
          min: minHeightDev
        },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: cameraRequest.fps
        },

        deviceId: {
          exact: cameraId
        }
      },
      audio: false
    } as MediaStreamConstraints;

    // Require a specific camera by its ID here.
    if (cameraId && request.video) {
      //@ts-ignore
      request.video.deviceId = { exact: cameraId };
      //@ts-ignore
      request.video.facingMode = { exact: 'environment' };
    }

    return request;
  }

  // Developer environment, but testing on Android.
  if (isLocalDevelopment && !isIos && navigator.maxTouchPoints >= 2) {
    console.info('Creating android camera request');
    let maxWidthDev = cameraRequest.width.max;
    let maxHeightDev = cameraRequest.height.max;
    let minWidthDev = cameraRequest.width.min;
    let minHeightDev = cameraRequest.height.min;
    return {
      video: {
        width: { max: maxWidthDev, min: minWidthDev },
        height: {
          max: maxHeightDev,
          min: minHeightDev
        },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: cameraRequest.fps
        },

        // Require a specific camera here.
        facingMode: { exact: 'environment' }
      },
      audio: false
    } as MediaStreamConstraints;
  }

  // Developer environment, but testing on iDevies.
  if (isLocalDevelopment && isIos) {
    console.info('Creating iOS dev capture request.');
    let maxWidthDev = cameraRequest.width.max;
    let maxHeightDev = cameraRequest.height.max;
    let minWidthDev = cameraRequest.width.min;
    let minHeightDev = cameraRequest.height.min;
    return {
      video: {
        width: { max: maxWidthDev, min: minWidthDev },
        height: {
          max: maxHeightDev,
          min: minHeightDev
        },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: cameraRequest.fps
        },

        // Require a specific camera here.
        facingMode: { exact: 'environment' }
      },
      audio: false
    } as MediaStreamConstraints;
  }

  // This one is for testers. They tend to be testing on laptops,
  // although we can't exactly query those environments.
  if (isQA || (isDevelopment && !isIos)) {
    console.info('Creating QA camera request');
    return {
      video: {
        width: { max: cameraRequest.width.max, min: cameraRequest.width.min },
        height: {
          max: cameraRequest.height.max,
          min: cameraRequest.height.min
        },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: cameraRequest.fps
        },
        aspectRatio: { exact: 16 / 9 },

        // The user is likely to have a facing type camera on their laptop.
        facingMode: { ideal: 'environment' }
      },
      audio: false
    } as MediaStreamConstraints;
  }

  // This is the default preferences, which is also used in production.
  console.info('Creating production camera request.');
  return {
    video: {
      width: { max: cameraRequest.width.max, min: cameraRequest.width.min },
      height: { max: cameraRequest.height.max, min: cameraRequest.height.min },

      // Higher FPS is good for a scanning operation.
      frameRate: {
        ideal: cameraRequest.fps
      },

      aspectRatio: { exact: 16 / 9 },

      // Require a specific camera here.
      facingMode: { exact: 'environment' }
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
