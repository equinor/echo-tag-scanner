import { CameraProps } from './CoreCamera';
import { Postprocessor } from './Postprocessor';
import { DrawImageParameters } from './CanvasHandler';

/**
 * This object acts as a proxy towards CoreCamera.
 * From a user perspective, it is the viewfinder and camera controls.
 */
class Camera extends Postprocessor {
  private _torchState = false;
  private _url: string | undefined;
  protected _isScanning = false;

  constructor(props: CameraProps) {
    super(props);
  }

  public get url(): string {
    return this._url;
  }

  public toggleTorch = (): void => {
    this._torchState = !this._torchState;
    this.torch(this._torchState);
  };

  public pauseViewfinder(): boolean {
    this._viewfinder.pause();
    return this._viewfinder.paused;
  }

  public resumeViewfinder(): boolean {
    this._viewfinder.play();
    return this._viewfinder.paused;
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
  protected async capturePhoto(
    captureArea: DOMRect
  ): Promise<Blob | undefined> {
    this.canvasHandler.clearCanvas();
    const settings = this._videoTrack?.getSettings();

    if (settings) {
      if (
        typeof settings.height === 'number' &&
        typeof settings.width === 'number'
      ) {
        const params: DrawImageParameters = {
          sx: captureArea.x,
          sy: captureArea.y,
          sHeight: captureArea.height,
          sWidth: captureArea.width,
          dx: 0,
          dy: 0,
          dHeight: captureArea.height,
          dWidth: captureArea.width
        };
        var captureBlob = await this._canvasHandler.draw(
          this._viewfinder,
          params
        );
      }
    } else {
      throw new Error(
        'The camera was not able to do an initial capture because of missing settings.'
      );
    }

    return captureBlob;
  }
}

export { Camera };
