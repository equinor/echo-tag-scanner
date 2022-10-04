import {
  CameraProps,
  CameraResolution,
  DrawImageParameters,
  ZoomSteps,
  ZoomMethod
} from '@types';
import {
  logger,
  reportMediaStream,
  reportVideoTrack,
  getOrientation,
  determineZoomMethod
} from '@utils';
import { CoreCamera } from './coreCamera';
import { Postprocessor } from './postprocessor';
import { getNotificationDispatcher as dispatchNotification } from '@utils';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends Postprocessor {
  /** Is the torch turned on or not. */
  private _torchState = false;

  /** Detects changes to the device orientation and refreshes the camera feed. */
  private _orientationObserver: ResizeObserver;

  /** The method of zooming the viewfinder
   * - undefined: Zooming is not enabled.
   * - simulated: Manipulates the camera feed scale in order to simulate digital zoom.
   * - native: Uses MediaStream API to apply digital zoom.
   */
  private _zoomMethod: ZoomMethod | undefined;

  constructor(props: CameraProps) {
    super(props);
    this._orientationObserver = new ResizeObserver(
      this.handleOrientationChange.bind(this)
    );
    this._orientationObserver.observe(this.viewfinder);
    this._orientationObserver;
    this._zoomMethod = determineZoomMethod.call(this);

    if (this.videoTrack) {
      this.videoTrack.addEventListener('ended', this.refreshStream.bind(this));
    }

    // For debugging purposes.
    MediaStreamTrack.prototype.toString = reportVideoTrack;
    MediaStream.prototype.toString = reportMediaStream;
  }

  public get zoomMethod(): ZoomMethod | undefined {
    return this._zoomMethod;
  }

  public set zoomMethod(newMethod: ZoomMethod | undefined) {
    this._zoomMethod = newMethod;
  }

  /** Handles how the camera shoudl behave when an orientation change happens.
   * This should eventually be replaced with the Screen Orientation API.
   */
  private handleOrientationChange() {
    const newOrientation = getOrientation();

    if (newOrientation !== this.currentOrientation) {
      // Device orientation has changed. Refresh the video stream.
      this.currentOrientation = newOrientation;
      this.refreshStream().then((res) => {
        const newOrientationEvent = new CustomEvent<CameraResolution>(
          'orientationChange',
          {
            detail: {
              width: this.videoTrackSettings?.width,
              height: this.videoTrackSettings?.height,
              fps: this.videoTrackSettings?.frameRate
            }
          }
        );
        globalThis.dispatchEvent(newOrientationEvent);
      });
    }
  }

  /**
   * Performs a complete refresh of the camera stream by requesting a new mediastream object.
   * @param {number} requestedResolution Override the requested resolution.
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

      logger.log('EchoDevelopment', () => {
        console.group('The media stream was refreshed');
        console.info('The mediastream ->', newMediastream);
        console.info(
          'The new camera constraints -> ',
          newTrack.getConstraints()
        );
        console.info('The new video track -> ', newTrack);
        console.groupEnd();
      });

      return {
        width: this.videoTrackSettings.width,
        height: this.videoTrackSettings.height,
        fps: this.videoTrackSettings.frameRate
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
    this._orientationObserver.disconnect();
  }

  /**
   * Performs a simulated digital zoom.
   * @param {ZoomSteps} newZoomLevel The new zoom value.
    if (LogLevel[incomingLevel] <= this._logLevel) callback();
   * @returns {CameraResolution} Information about the new viewfinder resolution or undefined if no zooming took place.
   */
  public alterSimulatedZoom(
    newZoomLevel: ZoomSteps
  ): CameraResolution | undefined {
    if (newZoomLevel === 1 || newZoomLevel === 2) {
      if (this.baseResolution?.width && this.baseResolution?.height) {
        const simulatedZoom = {
          width: this.baseResolution.width * newZoomLevel,
          height: this.baseResolution.height * newZoomLevel,
          zoomLevel: newZoomLevel
        };

        if (simulatedZoom?.zoomLevel) this.zoom = newZoomLevel;
        if (simulatedZoom?.width && simulatedZoom?.height) {
          this.viewfinder.width = simulatedZoom.width;
          this.viewfinder.height = simulatedZoom.height;
        }
        return simulatedZoom;
      }
    }

    return undefined;
  }

  /** Accepts a new zoom value from the Zoom slider component and attempts to perform a native digital zoom */
  public alterZoom = (
    ev: React.FormEvent<HTMLDivElement>,
    newZoom: number[] | number
  ): void => {
    if (Array.isArray(newZoom) && ev.target) {
      if (newZoom[0] === 1 || newZoom[0] === 2 || newZoom[0] === 3) {
        this.zoom = newZoom[0];
      }
    } else if (typeof newZoom === 'number') {
      if (newZoom === 1 || newZoom === 2 || newZoom === 3) {
        this.zoom = newZoom;
      }
    }
  };

  /**
   * Captures a photo, and stores it as a drawing on the postprocessing canvas.
   */
  protected async capturePhoto(): Promise<Blob> {
    this.canvasHandler.clearCanvas();

    // TODO: Document how sX and sY is determined.
    const sx = this.zoom === 1 ? 0 : this.viewfinder.videoWidth / this.zoom / 2;
    const sy =
      this.zoom === 1 ? 0 : this.viewfinder.videoHeight / this.zoom / 2;
    const params: DrawImageParameters = {
      sx,
      sy,
      sWidth: this.viewfinder.videoWidth / this.zoom,
      sHeight: this.viewfinder.videoHeight / this.zoom,
      dx: 0,
      dy: 0,
      dWidth: this.viewfinder.videoWidth / this.zoom,
      dHeight: this.viewfinder.videoHeight / this.zoom
    };

    return this._canvasHandler.draw(this.viewfinder, params);
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

function calculateScaleFactor(viewfinder: HTMLVideoElement): {
  scale: number;
  videoWidth: number;
  videoHeight: number;
} {
  // this is 746px on iPhone
  const videoWidth = viewfinder.videoWidth;
  // this is 428px on iPhone
  const elementWidth = viewfinder.width;
  // this is 428px on iPhone
  const videoHeight = viewfinder.videoHeight;
  // this is 746px on iPhone
  const elementHeight = viewfinder.height;

  // This finds scale x + y and handles enlargement / reduction in sizes.
  let scale_x = elementWidth / videoWidth;
  if (scale_x > 1) {
    scale_x = videoWidth / elementWidth;
  }

  let scale_y = elementHeight / videoHeight;
  if (scale_y > 1) {
    scale_y = videoHeight / elementHeight;
  }

  // FIXME: This makes it better width'wise in browsers
  // but we still have small offset issues in iphone/mobiles...
  let scale = Math.min(scale_x, scale_y);

  dispatchNotification({ message: String(scale), autohideDuration: 5000 })();

  return { scale, videoWidth, videoHeight };
}

export { Camera };