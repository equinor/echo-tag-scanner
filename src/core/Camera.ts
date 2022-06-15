import { CameraProps } from './CoreCamera';
import { Postprocessor } from './Postprocessor';
import { ocrRead, TagScanningStages } from '@services';
import {
  PossibleFunctionalLocations,
  ParsedComputerVisionResponse
} from '@types';
import { DrawImageParameters } from './CanvasHandler';

class Camera extends Postprocessor {
  private _torchState = false;
  private _url: string | undefined;
  private _isScanning = false;

  constructor(props: CameraProps) {
    super(props);
  }

  public set isScanning(value: boolean) {
    this._isScanning = value;
  }

  public get isScanning() {
    return this._isScanning;
  }

  public get url(): string {
    return this._url;
  }

  public toggleTorch = (): void => {
    this._torchState = !this._torchState;
    this.torch(this._torchState);
  };

  public pauseViewfinder(): boolean {
    this._viewfinder.current.pause();
    return this._viewfinder.current.paused;
  }

  public resumeViewfinder(): boolean {
    this._viewfinder.current.play();
    return this._viewfinder.current.paused;
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
   * Captures a photo, stores it in memory and as a drawing on the canvas.
   * @this CoreCamera
   */
  protected async capturePhoto(captureArea: DOMRect): Promise<void> {
    this.canvasHandler.clearCanvas();
    const settings = this._videoTrack?.getSettings();
    console.group('Video dimensions');
    console.info(
      'intrinsic -> ',
      this._viewfinder.current.videoWidth,
      this._viewfinder.current.videoHeight
    );
    console.info(
      'regular -> ',
      this._viewfinder.current.width,
      this._viewfinder.current.height
    );
    console.groupEnd();
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
        const captureBlob = await this._canvasHandler.draw(
          this._viewfinder.current,
          params
        );
        this._capture = captureBlob;
      }
    }
  }

  public async scan(
    area: DOMRect,
    callback: (property: TagScanningStages, value: boolean) => void
  ): Promise<
    PossibleFunctionalLocations | ParsedComputerVisionResponse | undefined
  > {
    this.pauseViewfinder();
    await this.capturePhoto(area);
    if (this.capture) {
      this.logImageStats(this.capture, 'The cropped photo.');
      if (this.capture.size > 50000) await this.blackAndWhite();
      if (this.capture.size > 50000) await this.scale(area);
      callback('uploading', true);
      const result = await ocrRead(this.capture);
      this.isScanning = false;
      callback('uploading', false);
      return result;
    } else {
      this.isScanning = false;
      return undefined;
    }
  }
}

export { Camera };
