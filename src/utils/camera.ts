import { Camera } from '@cameraLogic';
import {
  getNotificationDispatcher as dispatchNotification,
  getOrientation,
  isDevelopment,
  isLocalDevelopment,
  isQA
} from '@utils';
import { ZoomMethod } from '@types';
import { staticResolution } from '../const';
import EchoUtils from '@equinor/echo-utils';
import { EchoEnv } from '@equinor/echo-core';

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
      max: 3
    } as ZoomMethod;
  }
}

function getCameraPreferences(): MediaStreamConstraints {
  const isIos = EchoUtils.Utils.iOs.isIosDevice();

  // Developer enviroment, use this for desktop.
  if (isLocalDevelopment && !isIos) {
    return {
      video: {
        width: { max: staticResolution.width, min: 848 },
        height: { max: staticResolution.height, min: 480 },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: staticResolution.fps
        },

        // Require a specific camera by its ID here.
        deviceId: {
          exact:
            '883c79d936715fb3d0f70390c627a7bcb9ff395f6835fdf2b068373a35764ec2'
        }
      },
      audio: false
    } as MediaStreamConstraints;
  }

  // Developer environment, but testing on iDevies.
  if (isLocalDevelopment && isIos) {
    return {
      video: {
        width: { max: staticResolution.width, min: 848 },
        height: { max: staticResolution.height, min: 480 },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: staticResolution.fps
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
    return {
      video: {
        width: { max: staticResolution.width, min: 848 },
        height: { max: staticResolution.height, min: 480 },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: staticResolution.fps
        },

        // The user is likely to have a facing type camera on their laptop.
        facingMode: { ideal: 'environment' }
      },
      audio: false
    } as MediaStreamConstraints;
  }

  // This is the default preferences, which is also used in production.
  return {
    video: {
      width: { max: staticResolution.width, min: 848 },
      height: { max: staticResolution.height, min: 480 },

      // Higher FPS is good for a scanning operation.
      frameRate: {
        ideal: staticResolution.fps
      },

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
