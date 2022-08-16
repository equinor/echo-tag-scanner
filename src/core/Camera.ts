import { CameraProps, DrawImageParameters } from '@types';
import { logger } from '@utils';
import { Postprocessor } from './Postprocessor';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends Postprocessor {
  private _torchState = false;

  constructor(props: CameraProps) {
    super(props);
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

    // FIXME: move to own handling - should only need to be calculated on
    // resize observer thingymajiggy -- and should probably always be <1?
    // Gotta verify on screens with larger viewport than mediastream/video intrinsic size
    const scale = elementWidth / videoWidth;

    // width and height of the capture area scaled to original image
    const sWidth = captureArea.height * scale;
    const sHeight = captureArea.width * scale;

    const sx = videoWidth / 2 - sWidth / 2;
    const sy = videoHeight / 2 - sHeight / 2;

    const params: DrawImageParameters = {
      sx,
      sy,
      sHeight,
      sWidth,
      dx: 0,
      dy: 0,
      dHeight: captureArea.height,
      dWidth: captureArea.width
    };
    return this._canvasHandler.draw(this.viewfinder, params);
  }

  public reportCameraFeatures() {
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
  }
}

export { Camera };
