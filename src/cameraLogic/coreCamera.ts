import {
  handleError,
  getOrientation,
  logger,
  getCameraPreferences,
  isLocalDevelopment
} from '@utils';
import { ErrorRegistry } from '@const';
import { CameraProps, CameraResolution, ZoomSteps } from '@types';

/**
 * This object is concerned with the core features of a camera.
 */
class CoreCamera {
  private _mediaStream: MediaStream;
  private _viewfinder: HTMLVideoElement;
  private _videoTrack?: MediaStreamTrack;
  private _videoTrackSettings?: MediaTrackSettings;
  private _capabilities?: MediaTrackCapabilities = undefined;
  private _currentOrientation: 'portrait' | 'landscape';
  private _activeCamera?: string;
  private _zoom: ZoomSteps;

  /** Records the base camera resolution before any simulated zoom has taken place. */
  private _baseResolution: CameraResolution;

  constructor(props: CameraProps) {
    this._viewfinder = props.viewfinder;
    this._mediaStream = props.mediaStream;
    this._videoTrack = props.mediaStream.getVideoTracks()[0];
    this._capabilities = this._videoTrack.getCapabilities();
    this._videoTrackSettings = this._videoTrack.getSettings();
    this._currentOrientation = getOrientation();
    this._activeCamera = this._videoTrackSettings.facingMode;
    this._viewfinder.srcObject = props.mediaStream;
    this._zoom = 1;

    /** Currently holds a reference to the initial viewfinder dimensions.
     * Can be improved by moving these to an extended HTMLVideoElement
     */
    this._baseResolution = {
      width: this._viewfinder.width,
      height: this._viewfinder.height,
      zoomLevel: 1
    };
  }

  public get videoTrack(): MediaStreamTrack | undefined {
    return this._videoTrack;
  }

  public set videoTrack(newVideoTrack) {
    this._videoTrack = newVideoTrack;
  }

  public get capabilities(): MediaTrackCapabilities | undefined {
    return this._capabilities;
  }

  public set capabilities(newCapabilities) {
    this._capabilities = newCapabilities;
  }

  public get videoTrackSettings(): MediaTrackSettings | undefined {
    return this._videoTrackSettings;
  }

  public set videoTrackSettings(newVideoTrackSettings) {
    this._videoTrackSettings = newVideoTrackSettings;
  }

  public get viewfinder() {
    return this._viewfinder;
  }

  public get mediaStream() {
    return this._mediaStream;
  }

  public get currentOrientation() {
    return this._currentOrientation;
  }

  public set currentOrientation(newOrientation) {
    this._currentOrientation = newOrientation;
  }

  public get activeCamera() {
    return this._activeCamera;
  }

  public set activeCamera(newActiveCamera) {
    this._activeCamera = newActiveCamera;
  }

  public get baseResolution() {
    return this._baseResolution;
  }

  public set baseResolution(newBaseResolution) {
    this._baseResolution = newBaseResolution;
  }

  public get zoom(): ZoomSteps {
    return this._zoom;
  }

  public set zoom(zoomValue: ZoomSteps) {
    this._videoTrack
      ?.applyConstraints({ advanced: [{ zoom: zoomValue }] })
      .then(() => (this._zoom = zoomValue))
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

  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  static async getMediastream(): Promise<MediaStream> {
    const cameraPreferences = getCameraPreferences(isLocalDevelopment);
    console.group('Requesting camera feed');
    console.info(console.info('%c⧭', 'color: #0088cc', cameraPreferences));
    console.groupEnd();
    return await navigator.mediaDevices.getUserMedia(cameraPreferences);
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
