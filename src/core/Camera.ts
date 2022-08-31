import { CameraProps, DrawImageParameters } from '@types';
import {
  logger,
  reportMediaStream,
  getNotificationDispatcher as dispatchNotification,
  reportVideoTrack,
  getOrientation
} from '@utils';
import { CoreCamera } from './CoreCamera';
import { Postprocessor } from './Postprocessor';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends Postprocessor {
  private _torchState = false;
  private _orientationObserver: ResizeObserver;

  constructor(props: CameraProps) {
    super(props);
    this._orientationObserver = new ResizeObserver(
      this.handleOrientationChange.bind(this)
    );
    this._orientationObserver.observe(this.viewfinder);
    if (this.videoTrack) {
      this.videoTrack.addEventListener(
        'ended',
        this.refreshStream.bind(this, false)
      );
    }

    // For debugging purposes.
    MediaStreamTrack.prototype.toString = reportVideoTrack;
    MediaStream.prototype.toString = reportMediaStream;
  }

  private handleOrientationChange() {
    const newOrientation = getOrientation();

    if (newOrientation !== this.currentOrientation) {
      // Device orientation has changed. Refresh the video stream.
      this.currentOrientation = newOrientation;
      this.refreshStream();
    }
  }

  /**
   * Performs a complete refresh of the camera stream by requesting a new mediastream object.
   */
  public async refreshStream() {
    try {
      const newMediastream = await CoreCamera.getMediastream();

      const newTrack = newMediastream.getVideoTracks()[0];
      newTrack.addEventListener('ended', this.refreshStream.bind(this, false));
      this.videoTrackSettings = newTrack.getSettings();
      this.videoTrack = newTrack;
      this.viewfinder.srcObject = newMediastream;
      this.capabilities = newTrack.getCapabilities();
      this.activeCamera = this.videoTrackSettings.facingMode;
      this.currentOrientation = getOrientation();

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
    } catch (error) {
      if (error instanceof Error) {
        logger.trackError(error);
        throw error;
      }
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

  public pauseViewfinder(): boolean {
    this.viewfinder.pause();
    return this.viewfinder.paused;
  }

  public resumeViewfinder(): boolean {
    this.viewfinder.play();
    return this.viewfinder.paused;
  }

  public stopCamera() {
    if (this.videoTrack) {
      this.videoTrack.stop();
    }
    this._orientationObserver.disconnect();
  }

  public alterZoom = (
    ev: React.FormEvent<HTMLDivElement>,
    newValue: number[] | number
  ): void => {
    if (Array.isArray(newValue) && ev.target && this.isValidZoom(newValue[0])) {
      this.zoom(newValue[0]);
    } else if (typeof newValue === 'number') {
      this.zoom(newValue);
    }
  };

  private isValidZoom(zoomValue: number) {
    if (this.capabilities?.zoom && typeof zoomValue === 'number') {
      return (
        zoomValue >= this.capabilities?.zoom?.min &&
        zoomValue <= this.capabilities?.zoom?.max
      );
    }
  }

  /**
   * Captures a photo, and stores it as a drawing on the postprocessing canvas.
   */
  protected async capturePhoto(captureArea: DOMRect): Promise<Blob> {
    this.canvasHandler.clearCanvas();

    const { scale, videoWidth, videoHeight } = calculateScaleFactor(
      this.viewfinder
    );
    // width and height of the capture area on the videofeed
    const sWidth = captureArea.width * scale;
    const sHeight = captureArea.height * scale;
    // x and y position of top left corner of the capture area on videofeed
    const sx = videoWidth / 2 - sWidth / 2;
    const sy = videoHeight / 2 - sHeight / 2;

    const params: DrawImageParameters = {
      sx,
      sy,
      sWidth,
      sHeight,
      dx: 0,
      dy: 0,
      dWidth: captureArea.width,
      dHeight: captureArea.height
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

  return { scale, videoWidth, videoHeight };
}

export { Camera };
