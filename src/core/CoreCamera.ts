import { handleError, getOrientation, logger, isDevelopment } from '@utils';
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
  private _activeCamera?: string;

  constructor(props: CameraProps) {
    this._viewfinder = props.viewfinder;
    this._mediaStream = props.mediaStream;
    this._videoTrack = props.mediaStream.getVideoTracks()[0];
    this._capabilities = this._videoTrack.getCapabilities();
    this._videoTrackSettings = this._videoTrack.getSettings();
    this._currentOrientation = getOrientation();
    this._activeCamera = this._videoTrackSettings.facingMode;
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

  public get activeCamera() {
    return this._activeCamera;
  }

  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  static async promptCameraUsage(
    facingModeOverride?: 'environment' | 'user',
    additionalCaptureOptions?: DisplayMediaStreamConstraints
  ): Promise<MediaStream> {
    const cameraPreferences = {
      video: {
        width: {
          ideal: globalThis.innerWidth
        },
        height: {
          ideal: globalThis.innerHeight
        },

        // Higher FPS is good for a scanning operation.
        frameRate: {
          ideal: 60
        },

        // In production, we always want the rear camera to be selected.
        facingMode:
          { exact: facingModeOverride } || isDevelopment
            ? { ideal: 'environment' }
            : { exact: 'environment' }
      },
      audio: false,
      ...additionalCaptureOptions
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(
      cameraPreferences
    );

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

  public async refreshStream(toggleCamera = false) {
    const newActiveCamera = (() => {
      if (toggleCamera) {
        if (this._activeCamera === 'environment') return 'user';
        else return 'environment';
      }
    })();
    try {
      const newMediastream = await CoreCamera.promptCameraUsage(
        newActiveCamera
      );
      const newTrack = newMediastream.getVideoTracks()[0];
      const newConstraints = newTrack.getConstraints();
      await this._videoTrack?.applyConstraints(newConstraints);
      this.viewfinder.srcObject = newMediastream;
      logger.log('EchoDevelopment', () => {
        console.group('Refreshing camera stream');
        console.info('The mediastream ->', newMediastream);
        console.info('The new camera constraints -> ', newConstraints);
        console.info('The new video track -> ', newTrack);
        console.groupEnd();
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.trackError(error);
        throw error;
      }
    }
  }

  public zoom(zoomValue: number): void {
    this._videoTrack
      ?.applyConstraints({ advanced: [{ zoom: zoomValue }] })
      .catch(onZoomRejection);

    function onZoomRejection(reason: unknown) {
      logger.log('QA', () => {
        console.error(
          'Encountered an error while toggling the torch. -> ',
          reason
        );
      });
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
      logger.log('QA', () => console.warn('Device does not support the torch'));
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
