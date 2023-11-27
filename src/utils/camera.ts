import { Camera, CoreCamera } from "@cameraLogic";
import {
  getNotificationDispatcher as dispatchNotification, isLocalDevelopment,
} from "@utils";
import { ZoomMethod } from "@types";
import { fixedCameraSettingsRequest } from "@const";

function assignZoomSettings(
  type: "min" | "max" | "step" | "value",
  camera: Camera,
): string {
  if (type === "value") {
    if (camera.videoTrackSettings?.zoom) {
      return String(camera.videoTrackSettings.zoom);
    } else {
      return "1";
    }
  }
  if (camera.capabilities?.zoom) {
    if (camera.capabilities.zoom[type]) {
      return String(camera.zoom[type]);
    }
  }
  // If zoom capabilities does not exist, we need to return a stringified zero
  // to prevent a stringified undefined to be assigned to the zoom slider.
  return "0";
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
      dispatchNotification("The torch is not supported on this device.")();
    };

    if (camera.capabilities?.torch) {
      return onToggleTorch();
    } else {
      return onToggleUnsupportedTorch();
    }
  };
}

function determineZoomMethod(this: CoreCamera): ZoomMethod {
  // Device has native support.
  if (this.capabilities?.zoom) {
    // Ensure the max zoom is not above 3.
    const maxZoom = this.capabilities?.zoom.max > 3
      ? 3
      : this.capabilities?.zoom.max;
    return {
      type: "native",
      min: 1,
      max: maxZoom,
    } as ZoomMethod;

    // Device does not have native support, fall back to simulated zoom.
  } else {
    return {
      type: "simulated",
      min: 1,
      max: 2,
    } as ZoomMethod;
  }
}

function getCameraPreferences(): MediaStreamConstraints {
  const cameraSettingsRequest = {
    ...fixedCameraSettingsRequest
  };

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

      facingMode: isLocalDevelopment ? {ideal: "environment"} : { exact: 'environment' }
    },
    audio: false
  } as MediaStreamConstraints;
}

export {
  assignZoomSettings,
  determineZoomMethod,
  getCameraPreferences,
  getTorchToggleProvider,
};
