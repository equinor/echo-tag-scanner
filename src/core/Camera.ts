import { CameraProps, DrawImageParameters } from '@types';
import {
  logger,
  reportMediaStream,
  getNotificationDispatcher as dispatchNotification
} from '@utils';
import { Postprocessor } from './Postprocessor';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends Postprocessor {
  private _torchState = false;

  constructor(props: CameraProps) {
    super(props);
    this.mediaStream.toString = reportMediaStream.bind(this.mediaStream);

    if (this.videoTrack) {
      this.videoTrack.addEventListener(
        'ended',
        this.refreshVideoTrack.bind(this)
      );

      this.videoTrack.addEventListener('mute', this.logMute);
    }
  }

  private logMute() {
    console.log('video track is muted');
    dispatchNotification('The video track was muted')();
  }

  private refreshVideoTrack() {
    if (this.videoTrack && this.backupVideoTrack) {
      dispatchNotification({
        message: 'The video track has ended',
        autohideDuration: 2000
      })();

      // Remove the ended video track from the stream.
      this.videoTrack.removeEventListener(
        'ended',
        this.refreshVideoTrack.bind(this)
      );
      this.mediaStream.removeTrack(this.videoTrack);

      // Take a fresh backup before assigning the backuped track.
      const newBackupVideoTrack = this.backupVideoTrack.clone();

      // Assign backed up track and setup
      this.videoTrack = this.backupVideoTrack;
      this.videoTrack.addEventListener(
        'ended',
        this.refreshVideoTrack.bind(this)
      );
      this.videoTrack.addEventListener('mute', this.logMute.bind(this));
      this.mediaStream.addTrack(this.videoTrack);

      // Save the new cloned backup
      this.backupVideoTrack = newBackupVideoTrack;
      if (this.videoTrack.readyState === 'live') {
        console.group('Backup video track was deployed');
        console.log('New track -> ', this.videoTrack);
        console.log('New backup track -> ', this.backupVideoTrack);
        console.groupEnd();
      }
    } else {
      throw new Error('An error occured while trying to refresh video track');
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
    this.orientationObserver.disconnect();
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

    // this is 746px on iPhone
    const videoWidth = this.viewfinder.videoWidth;
    // this is 428px on iPhone
    const elementWidth = this.viewfinder.width;
    // this is 428px on iPhone
    const videoHeight = this.viewfinder.videoHeight;
    // this is 746px on iPhone
    const elementHeight = this.viewfinder.height;

    // FIXME: move to own handling - should only need to be calculated on
    // resize observer thingymajiggy -- and should probably always be <1?
    // Gotta verify on screens with larger viewport than mediastream/video intrinsic size
    let scale_x = elementWidth / videoWidth;
    let scale_y = elementHeight / videoHeight;

    // When scale is larger here it means that the element is larger than videofeed
    // so our scaling factor needs to be swapped?
    // Not sure we ever need X and Y scaling tho..
    if (scale_x > 1) {
      scale_x = videoWidth / elementWidth;
    }

    if (scale_y > 1) {
      scale_y = videoHeight / elementHeight;
    }

    // width and height of the capture area on the videofeed
    const sWidth = captureArea.width * scale_x;
    const sHeight = captureArea.height * scale_y;
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

export { Camera };
