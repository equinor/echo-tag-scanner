import {
  CameraProps,
  CameraResolution,
  DrawImageParameters,
  ZoomSteps,
  ZoomMethod,
  ZoomEventDetail
} from '@types';
import {
  logger,
  reportMediaStream,
  reportVideoTrack,
  getOrientation,
  determineZoomMethod,
  handleError,
  dispatchCameraResolutionEvent,
  dispatchZoomEvent
} from '@utils';
import { CoreCamera } from './coreCamera';
import { Postprocessor } from './postprocessor';
import { ErrorRegistry } from '../const';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends Postprocessor {
  /** Is the torch turned on or not. */
  private _torchState = false;
  private _captureUrl: string | undefined;

  /** The method of zooming the viewfinder
   * - undefined: Zooming is not enabled.
   * - simulated: Manipulates the camera feed scale in order to simulate digital zoom.
   * - native: Uses MediaStream API to apply digital zoom.
   */
  private _zoomMethod: ZoomMethod;

  constructor(props: CameraProps) {
    super(props);
    this._zoomMethod = determineZoomMethod.call(this);

    if (this.videoTrack) {
      this.videoTrack.addEventListener('ended', this.refreshStream.bind(this));
    }

    // For debugging purposes.
    MediaStreamTrack.prototype.toString = reportVideoTrack;
    MediaStream.prototype.toString = reportMediaStream;
  }

  public get zoomMethod(): ZoomMethod {
    return this._zoomMethod;
  }

  public set zoomMethod(newMethod: ZoomMethod) {
    this._zoomMethod = newMethod;
  }
  public get captureUrl(): string | undefined {
    return this._captureUrl;
  }

  public set captureUrl(newUrl: string | undefined) {
    this._captureUrl = newUrl;
  }

  /**
   * Performs a complete refresh of the camera stream by requesting a new mediastream object.
   * @returns {CameraResolution} Returns the new camera dimensions and framerate.
   */
  public async refreshStream(): Promise<CameraResolution> {
    try {
      const newMediastream = await CoreCamera.getMediastream();

      const newTrack = newMediastream.getVideoTracks()[0];
      newTrack.addEventListener('ended', this.refreshStream.bind(this));

      this.videoTrackSettings = newTrack.getSettings();
      this.videoTrack = newTrack;
      this.viewfinder.srcObject = newMediastream;
      this.capabilities = newTrack.getCapabilities();
      this.activeCamera = this.videoTrackSettings.facingMode;
      this.currentOrientation = getOrientation();
      this._zoomMethod = determineZoomMethod.call(this);

      dispatchCameraResolutionEvent({
        width: this.videoTrackSettings.width,
        height: this.videoTrackSettings.height,
        zoomFactor: this.zoom,
        fps: this.videoTrackSettings.frameRate
      });

      return {
        width: this.videoTrackSettings.width,
        height: this.videoTrackSettings.height,
        fps: this.videoTrackSettings.frameRate,
        zoomFactor: this.zoom
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.trackError(error);
      }
      throw error;
    }
  }

  public toggleTorch = (): void => {
    if (this.capabilities?.zoom) {
      this._torchState = !this._torchState;
      this.torch(this._torchState);
    } else {
      console.warn(
        'Torch toggling failed. The video track is not capable of using the torch'
      );
    }
  };

  /** Pauses the viewfinder.
   * @returns {boolean} A boolean indicating if the viewfinder is paused.
   */
  public pauseViewfinder(): boolean {
    this.viewfinder.pause();
    return this.viewfinder.paused;
  }

  /** Resumes the viewfinder
   * @returns {boolean} A boolean indicating if the viewfinder is paused.
   */
  public resumeViewfinder(): boolean {
    this.viewfinder.play();
    return this.viewfinder.paused;
  }

  /** Stops the camera and cleans up the orientation observer.
   * If this is invoked, the viewfinder cannot be resumed again.
   */
  public stopCamera() {
    if (this.videoTrack) {
      this.videoTrack.stop();
    }
  }
  /**
   * Performs a simulated or native digital zoom.
   * @param {ZoomSteps} newZoomFactor The new zoom value.
   * @returns {CameraResolution} Information about the new viewfinder resolution or undefined if no zooming took place.
   */
  public alterZoom(
    newZoomFactor: ZoomSteps
  ): Promise<CameraResolution | undefined> {
    return new Promise((resolve) => {
      const zoomEventPayload: ZoomEventDetail = {
        zoomFactor: newZoomFactor,
        type: undefined
      };

      if (this._zoomMethod.type === 'native') {
        if (
          newZoomFactor >= this._zoomMethod.min &&
          newZoomFactor <= this._zoomMethod.max
        ) {
          this.videoTrack
            ?.applyConstraints({ advanced: [{ zoom: newZoomFactor }] })
            .then(() => {
              this.zoom = newZoomFactor;
              zoomEventPayload.type = 'native';
              dispatchZoomEvent(zoomEventPayload);

              resolve({
                width: this.baseResolution.width,
                height: this.baseResolution.height,
                zoomFactor: newZoomFactor
              });
            })
            .catch(rejectZoom);
        } else rejectZoom('invalid range');
      } else if (this._zoomMethod.type === 'simulated') {
        if (
          newZoomFactor >= this._zoomMethod.min &&
          newZoomFactor <= this._zoomMethod.max
        ) {
          this.zoom = newZoomFactor;
          zoomEventPayload.type = 'simulated';
          dispatchZoomEvent(zoomEventPayload);
        }
      }
    });

    function rejectZoom(reason: MediaStreamError | 'invalid range') {
      logger.log('QA', () => {
        console.error(
          'Encountered an error while performing native zoom. -> ',
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
   * Captures a photo using the entire video feed, and stores it as a drawing on the postprocessing canvas.
   */
  protected async capturePhoto(): Promise<Blob> {
    this.canvasHandler.clearCanvas();

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

    return await this._canvasHandler.draw(this.viewfinder, params);
  }

  /**
   * Accepts a new capture, creates an object URL from it and dispatches an event containing the new object URL.
   */
  protected notifyNewCapture(newCapture: Blob) {
    // Revoke the previous object URL if it exists.
    if (this._captureUrl) URL.revokeObjectURL(this._captureUrl);

    this._captureUrl = URL.createObjectURL(newCapture);
    globalThis.dispatchEvent(
      new CustomEvent('ets-capture', {
        detail: { url: this._captureUrl, size: newCapture.size }
      })
    );
  }

  public reportCameraFeatures() {
    logger.log('QA', () => {
      console.group('Starting camera');
      console.info(
        'Camera resolution -> ',
        this.viewfinder.videoWidth,
        this.viewfinder.videoHeight
      );
      console.info(
        'Viewfinder dimensions -> ',
        this.viewfinder.width,
        this.viewfinder.height
      );
      console.info(
        'Camera is capable of zooming: ',
        Boolean(this.capabilities?.zoom)
      );
      console.info(
        'Camera is capable of using the torch: ',
        Boolean(this.capabilities?.torch)
      );
      console.groupEnd();
    });
  }
}

export { Camera };