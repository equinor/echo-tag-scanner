import { Camera } from '@cameraLogic';
import {
  getNotificationDispatcher as dispatchNotification,
  getOrientation
} from '@utils';
import { ZoomMethod } from '@types';
import { staticResolution } from '../const';
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

function getCameraPreferences(
  isLocalDevelopment: boolean
): MediaStreamConstraints {
  const isIos = EchoUtils.Utils.iOs.isIosDevice();
  if (isLocalDevelopment && !isIos) {
    return {
      video: {
        width: { max: staticResolution.width, min: 848 },
        height: { max: staticResolution.height, min: 480 },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: staticResolution.fps
        },

        // Require a specific camera here.
        deviceId: {
          exact:
            'a874c50ce1a7f877e5d365c7ef7738d4881d76a22876cd61f0b708422936dc45'
        }
      },
      audio: false
    } as MediaStreamConstraints;
  } else {
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
}

export {
  assignZoomSettings,
  getTorchToggleProvider,
  determineZoomMethod,
  getCameraPreferences
};
