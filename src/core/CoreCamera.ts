import { handleError, getOrientation, logger } from '@utils';
import { ErrorRegistry } from '@enums';
import { CameraProps } from '@types';

/**
 * This object is concerned with the core features of a camera.
 */
class CoreCamera {
  private _mediaStream: MediaStream;
  private _viewfinder: HTMLVideoElement;
  private _videoTrack?: MediaStreamTrack;
  private _videoTrackSettings?: MediaTrackSettings;
  private _orientationObserver: ResizeObserver;
  private _capabilities?: MediaTrackCapabilities = undefined;
  private _currentOrientation: 'portrait' | 'landscape';

  constructor(props: CameraProps) {
    this._viewfinder = props.viewfinder;
    this._mediaStream = props.mediaStream;
    this._videoTrack = props.mediaStream.getVideoTracks()[0];
    this._capabilities = this._videoTrack.getCapabilities();
    this._videoTrackSettings = this._videoTrack.getSettings();
    this._currentOrientation = getOrientation();
    this._orientationObserver = new ResizeObserver(
      this.handleOrientationChange.bind(this)
    );
    this._orientationObserver.observe(this._viewfinder);
    this._viewfinder.srcObject = props.mediaStream;
  }

  public get videoTrack(): MediaStreamTrack | undefined {
    return this._videoTrack;
  }

  public get capabilities(): MediaTrackCapabilities | undefined {
    return this._capabilities;
  }

  public get videoTrackSettings(): MediaTrackSettings | undefined {
    return this._videoTrackSettings;
  }

  public get viewfinder() {
    return this._viewfinder;
  }

  public get orientationObserver() {
    return this._orientationObserver;
  }

  public get mediaStream() {
    return this._mediaStream;
  }

  public get currentOrientation() {
    return this._currentOrientation;
  }

  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  static async promptCameraUsage(
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ): Promise<MediaStream> {
    console.log(globalThis.innerWidth, globalThis.innerHeight);
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
            max: globalThis.innerWidth
          },
          height: {
            min: globalThis.innerHeight,
            max: globalThis.innerHeight
          },

          // Higher FPS is good for a scanning operation.
          frameRate: {
            ideal: 60
          },
          facingMode: 'environment'
        },
        audio: false,
        ...additionalCaptureOptions
      })
      .catch((error) => {
        console.error('media stream capture failed', error);
        if (error instanceof OverconstrainedError) {
          console.error(
            'Could not set camera constraints. The device/viewport dimensions should not be bigger than the resolution of the camera; or the camera is not capable of framerates over 15.'
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
      console.info('Switching orientation to: ', newOrientation);
      // Device orientation has changed. Refresh the video stream.
      this._currentOrientation = newOrientation;
      this.refreshStream();
    }
  }

  public async refreshStream() {
    try {
      const newMediastream = await CoreCamera.promptCameraUsage();
      const newTrack = newMediastream.getVideoTracks()[0];
      const newConstraints = newTrack.getConstraints();
      await this._videoTrack.applyConstraints(newConstraints);
    } catch (error) {
      console.error('An error occured while refreshing stream: ', error);
      if (typeof error === 'object') console.error(error.toString());
      throw new Error(error);
    }
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
      logger.log('Warning', () =>
        console.warn('Device does not support the torch')
      );
    }

    function onTorchRejection(reason: unknown) {
      throw handleError(
        ErrorRegistry.torchError,
        new Error('The torch could not be toggled, more info: ' + reason)
      );
    }
  }
}

export { CoreCamera };
