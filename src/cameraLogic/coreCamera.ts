import {
  determineZoomMethod,
  getCameraPreferences,
  getOrientation,
  handleError,
  logger
} from '@utils';
import { ErrorRegistry } from '@const';
import {
  CameraProps,
  CameraResolution,
  DeviceInformation,
  DrawImageParameters,
  ZoomMethod,
  ZoomSteps
} from '@types';
import { CanvasHandler } from './canvasHandler';

/**
 * This object is concerned with the core features of a camera.
 */
class CoreCamera {
  /**
   * Asks the user for permission to use the device camera and resolves a MediaStream object.
   */
  static async getMediastream(): Promise<MediaStream> {
    const cameraPreferences = getCameraPreferences();
    const stream = await navigator.mediaDevices
      .getUserMedia(cameraPreferences)
      .catch((error) => {
        throw error;
      });

    return stream;
  }

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

  /** The method of zooming the viewfinder
   * - undefined: Zooming is not enabled.
   * - simulated: Manipulates the camera feed scale in order to simulate digital zoom.
   * - native: Uses MediaStream API to apply digital zoom.
   */
  private _zoomMethod: ZoomMethod;

  /** Camera has its own canvas for capturing photos from media feed */
  private _canvasHandler: CanvasHandler;
  protected get canvasHandler() {
    return this._canvasHandler;
  }

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

    const canvas = new OffscreenCanvas(props.canvas.width, props.canvas.height);
    this._canvasHandler = new CanvasHandler(canvas);

    this._zoomMethod = determineZoomMethod.call(this);
  }

  /**
   * Captures a photo using the entire video feed, and stores it as a drawing on the postprocessing canvas.
   */
  public async capturePhoto(): Promise<ImageData> {
    this._canvasHandler.clearCanvas();

    const params: DrawImageParameters = {
      sx: 0,
      sy: 0,
      sWidth: this.viewfinder.videoWidth,
      sHeight: this.viewfinder.videoHeight,
      dx: 0,
      dy: 0,
      dWidth: this.viewfinder.videoWidth,
      dHeight: this.viewfinder.videoHeight
    };

    return this._canvasHandler.draw(this.viewfinder, params);
  }

  // #region Getters and Setters

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

  public get zoomMethod() {
    return this._zoomMethod;
  }

  public set zoomMethod(newMethod: ZoomMethod) {
    this._zoomMethod = newMethod;
  }
  // #endregion

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
