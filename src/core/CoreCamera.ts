import { handleError, getOrientation, getMediaConstraints } from '@utils';
import { ErrorRegistry } from '@enums';
import { CameraProps } from '@types';

/**
 * This object is concerned with the core features of a camera.
 */
class CoreCamera {
  protected _cameraEnabled = true;
  protected _mediaStream: MediaStream;
  protected _viewfinder: HTMLVideoElement;
  protected _videoTrack?: MediaStreamTrack;
  protected _settings?: MediaTrackSettings;
  protected _orientationObserver: ResizeObserver;
  public _capabilities?: MediaTrackCapabilities = undefined;
  public _currentOrientation: 'portrait' | 'landscape';

  constructor(props: CameraProps) {
    this._viewfinder = props.viewfinder;
    this._mediaStream = props.mediaStream;
    this._videoTrack = props.mediaStream.getVideoTracks()[0];
    this._capabilities = this._videoTrack.getCapabilities();
    this._settings = this._videoTrack.getSettings();
    this._viewfinder.srcObject = props.mediaStream;
    this._currentOrientation = getOrientation();
    this._orientationObserver = new ResizeObserver(
      this.handleOrientationChange.bind(this)
    );
    this._orientationObserver.observe(this._viewfinder);
  }

  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  static async promptCameraUsage(
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ): Promise<MediaStream> {
    const mediaStream = await navigator.mediaDevices
      .getUserMedia({
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
            ideal: globalThis.innerWidth,
            max: globalThis.innerWidth
          },
          height: {
            min: globalThis.innerHeight,
            max: globalThis.innerHeight,
            ideal: globalThis.innerHeight
          },

          // Higher FPS is good for a scanning operation.
          frameRate: {
            ideal: 60,
            min: 15,
            max: 60
          },
          facingMode: 'environment'
        },
        audio: false,
        ...additionalCaptureOptions
      })
      .catch((error) => {
        if (error instanceof OverconstrainedError) {
          console.error(
            'Could not set camera constraints. The viewport dimensions should not be below the dimensions of your camera device.'
          );
          throw handleError(ErrorRegistry.overconstrainedError, error as Error);
        }
        throw new Error(error);
      });

    return mediaStream;
  }

  private handleOrientationChange() {
    const newOrientation = getOrientation();

    if (newOrientation !== this._currentOrientation) {
      // Device orientation has changed. Refresh the video stream.
      this._currentOrientation = newOrientation;
      this.refreshStream();
    }
  }

  public get videoTrack(): MediaStreamTrack | undefined {
    return this._videoTrack;
  }

  public async refreshStream() {
    const newMediastream = await CoreCamera.promptCameraUsage();
    const newTrack = newMediastream.getVideoTracks()[0];
    const newConstraints = newTrack.getConstraints();
    await this._videoTrack.applyConstraints(newConstraints);
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
    this._orientationObserver.disconnect();
  }

  public reportCameraFeatures() {
    console.group('Starting camera');
    console.info(
      'Camera resolution -> ',
      this._viewfinder.videoWidth,
      this._viewfinder.videoHeight
    );
    console.info(
      'Viewfinder dimensions -> ',
      this._viewfinder.width,
      this._viewfinder.height
    );
    console.info(
      'Camera is capable of zooming: ',
      Boolean(this._capabilities?.zoom)
    );
    console.info(
      'Camera is capable of using the torch: ',
      Boolean(this._capabilities?.torch)
    );
    console.groupEnd();
  }
}

export { CoreCamera };
