import { RefObject } from 'react';
import { handleError } from '@utils';
import { ErrorRegistry } from '@enums';

export interface CameraProps {
  viewfinder: RefObject<HTMLVideoElement>;
  canvas?: RefObject<HTMLCanvasElement>;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

/**
 * This object is concerned with the core features of a camera.
 */
class CoreCamera {
  protected _cameraEnabled = true;
  protected _mediaStream?: MediaStream;
  protected _viewfinder?: RefObject<HTMLVideoElement>;
  protected _videoTrack?: MediaStreamTrack;
  public _capabilities?: MediaTrackCapabilities = undefined;
  protected _settings?: MediaTrackSettings;

  constructor(props: CameraProps) {
    this._viewfinder = props.viewfinder;
  }

  /**
   * Instansiates the rest of the camera's wheels and cogs.
   * Note: This runs after the construction is done.
   */
  protected setup(mediaStream: MediaStream) {
    this._mediaStream = mediaStream;
    this._videoTrack = mediaStream.getVideoTracks()[0];
    this._capabilities = this._videoTrack.getCapabilities();
    this._settings = this.videoTrack?.getSettings();
    if (this._viewfinder?.current) {
      this._viewfinder.current.srcObject = mediaStream;
    }
  }

  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  protected async promptCameraUsage(
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ): Promise<MediaStream> {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          /**
           * Set the intrinsic dimensions of the <video> element (the <video>.src attribute element is later set to the resolved MediaStream)
           * to whatever is the viewport width and height. This can be abstracted to the "camera capture resolution".
           *
           * This is needed in order to correctly crop the captures.
           * The canvas operations relies on the <video> element's intrinsic dimensions.
           */
          width: {
            min: globalThis.innerWidth,
            max: globalThis.innerWidth
          },
          height: {
            min: globalThis.innerHeight,
            max: globalThis.innerHeight
          },

          // Framerate has no impact on the image sizes, go as high as possible.
          frameRate: {
            ideal: 30,
            min: 15,
            max: 60
          },
          facingMode: 'environment'
        },
        audio: false,
        ...additionalCaptureOptions
      });

      return mediaStream;
    } catch (error) {
      throw new Error(error);
    }
  }

  public get cameraEnabled(): boolean {
    return this._cameraEnabled;
  }

  public get videoTrack(): MediaStreamTrack | undefined {
    return this._videoTrack;
  }

  public get capabilities(): MediaTrackCapabilities | undefined {
    return this._capabilities;
  }

  public get settings(): MediaTrackSettings | undefined {
    return this._settings;
  }

  public zoom(zoomValue: number): void {
    if (this._capabilities?.zoom) {
      this._videoTrack
        ?.applyConstraints({ advanced: [{ zoom: zoomValue }] })
        .catch(onZoomRejection);
    }

    function onZoomRejection(reason: unknown) {
      throw handleError(
        ErrorRegistry.zoomError,
        new Error('A zoom action failed, more info: ' + reason)
      );
    }
  }

  protected torch(toggled: boolean): void {
    if (this._capabilities?.torch) {
      this._videoTrack
        ?.applyConstraints({ advanced: [{ torch: toggled }] })
        .catch(onTorchRejection);
    } else {
      console.warn('Device does not support the torch');
    }

    function onTorchRejection(reason: unknown) {
      throw handleError(
        ErrorRegistry.torchError,
        new Error('The torch could not be toggled, more info: ' + reason)
      );
    }
  }

  public stopCamera() {
    if (this._videoTrack) {
      this._videoTrack.stop();
    }
  }

  public reportCameraFeatures() {
    console.group('Starting camera');
    console.info(
      'Camera resolution -> ',
      this._viewfinder.current.videoWidth,
      this._viewfinder.current.videoHeight
    );
    console.info(
      'Viewfinder dimensions -> ',
      this._viewfinder.current.width,
      this._viewfinder.current.height
    );
    console.info(
      'Camera is capable of zooming: ',
      Boolean(this._capabilities.zoom)
    );
    console.info(
      'Camera is capable of using the torch: ',
      Boolean(this._capabilities.torch)
    );
    console.groupEnd();
  }
}

export { CoreCamera };
