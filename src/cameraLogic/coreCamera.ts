import {
  handleError,
  getOrientation,
  logger,
  getCameraPreferences,
  DeviceInformation
} from '@utils';
import { ErrorRegistry } from '@const';
import {
  CameraProps,
  CameraResolution,
  CameraSettingsRequest,
  ZoomSteps
} from '@types';

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

  /** Holds information about the users system. */
  private _deviceInformation: DeviceInformation;

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
      zoomFactor: 1
    };
    this._deviceInformation = props.deviceInformation;
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
    this._zoom = zoomValue;
  }

  public get deviceInformation() {
    return this._deviceInformation;
  }

  public set deviceInformation(deviceInfo) {
    this._deviceInformation = deviceInfo;
  }

  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  static async getMediastream(
    cameraSettingsOverrides?: Partial<CameraSettingsRequest>
  ): Promise<MediaStream> {
    const cameraPreferences = getCameraPreferences(cameraSettingsOverrides);
    return await navigator.mediaDevices
      .getUserMedia(cameraPreferences)
      .catch((error) => {
        if (error instanceof OverconstrainedError) {
          if (error.constraint === 'width' || error.constraint === 'height') {
            handleResolutionOverconstrain(error);
          }
        }
        throw error;
      });

    function handleResolutionOverconstrain(error: OverconstrainedError) {
      console.warn(
        `The camera property ${error?.constraint} is overconstrained.`
      );
      console.warn(
        'This error is being gracefully handled. Operation of camera should continue as normal, but with a lower resolution.'
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
