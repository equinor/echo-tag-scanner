import {
  CameraProps,
  CameraResolution,
  DrawImageParameters,
  ZoomSteps,
  ZoomEventDetail,
  NewCaptureEventDetail
} from '@types';
import {
  logger,
  reportMediaStream,
  reportVideoTrack,
  getOrientation,
  determineZoomMethod,
  handleError,
  dispatchCameraResolutionEvent,
  dispatchZoomEvent,
  defineOrientationChangeEvent
} from '@utils';
import { CoreCamera } from './coreCamera';
import { Postprocessor } from './postprocessor';
import { ErrorRegistry } from '@const';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends CoreCamera {
  /** Is the torch turned on or not. */
  private _torchState = false;
  private _orientationChangeHandler:
    | 'DeviceOrientationAPI'
    | 'MatchMedia'
    | null;

  constructor(props: CameraProps) {
    super(props);

    if (this.videoTrack) {
      this.videoTrack.addEventListener('ended', this.refreshStream.bind(this));
    }
    this._orientationChangeHandler = defineOrientationChangeEvent.call(this);
    this.viewfinder.addEventListener(
      'play',
      () => {
        if (this.viewfinder.paused && !this.viewfinder.autoplay) {
          const error = new Error('The camera could not be started.', {
            cause: 'The viewfinder video element did not accept autoplaying.'
          });
          logger.trackError(error);
          handleError(ErrorRegistry.autoplayFailed, error);
        }
      },
      { once: true }
    );

    // For debugging purposes.
    MediaStreamTrack.prototype.toString = reportVideoTrack;
    MediaStream.prototype.toString = reportMediaStream;
  }

  /**
   * Determines an interval based on amount of wanted photos and duration to run and returns these.
   * @param amount The amount of captures wanted.
   * @param duration The total duration in which the photos should be captured.
   * @returns A Promise with list of captures.
   */
  public async burstCapturePhoto(
    amount: number,
    duration: number
  ): Promise<ImageData[]> {
    try {
      const settledBursts = await this._asyncBurst(amount, duration);
      return settledBursts;
    } catch (error) {
      clearInterval(this._intervalId);
      throw new Error('Failed to burst capture photos.');
    }
  }

  public get orientationChangeHandler() {
    return this._orientationChangeHandler;
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
      this.zoomMethod = determineZoomMethod.call(this);

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

      if (this.zoomMethod.type === 'native') {
        if (
          newZoomFactor >= this.zoomMethod.min &&
          newZoomFactor <= this.zoomMethod.max
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
      } else if (this.zoomMethod.type === 'simulated') {
        if (
          newZoomFactor >= this.zoomMethod.min &&
          newZoomFactor <= this.zoomMethod.max
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

  // #region Utils
  private _intervalId?: NodeJS.Timeout;
  private async _asyncBurst(
    amount: number,
    duration: number
  ): Promise<ImageData[]> {
    const interval = duration / amount;

    return new Promise((resolve) => {
      const bursts: Array<ImageData> = [];

      this._intervalId = setInterval(() => {
        bursts.push(this.capturePhoto());

        if (bursts.length === amount) {
          clearInterval(this._intervalId);
          resolve(bursts);
        }
      }, interval);
    });
  }

  // #endregion
}

export { Camera };
