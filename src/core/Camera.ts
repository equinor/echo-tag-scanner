import { CoreCamera, CoreCameraProps } from './CoreCamera';
import { getFunctionalLocations } from '@services';
import { MadOCRFunctionalLocations } from '@types';

export type CameraProps = CoreCameraProps;

class Camera extends CoreCamera {
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

  public async scan(): Promise<MadOCRFunctionalLocations | undefined> {
    this.pauseViewfinder();
    console.log('camera is paused', this._viewfinder.current.paused);
    await this.capturePhoto();
    if (this.capture) {
      console.group('The photo that was OCR scanned');
      console.info('Photo size in kilobytes: ', this.capture.size / 1000);
      console.info('Media type: ', this.capture.type);
      console.groupEnd();

      const result = await getFunctionalLocations(this.capture);
      this.isScanning = false;
      return result;
    } else {
      this.isScanning = false;
      return undefined;
    }
  }
}

export { Camera };
