import { CoreCamera, CoreCameraProps } from './CoreCamera';
import { getFunctionalLocations } from '@services';
import { MadOCRFunctionalLocations } from '@types';

export type CameraProps = CoreCameraProps;

class Camera extends CoreCamera {
  private _torchState = false;

  constructor(props: CameraProps) {
    super(props);
  }

  public toggleTorch = (): void => {
    this._torchState = !this._torchState;
    this.torch(this._torchState);
  };

  public alterZoom = (ev: React.FormEvent<HTMLDivElement>, newValue: number[] | number): void => {
    if (Array.isArray(newValue) && ev.target && this.isValidZoom(newValue[0])) {
      this.zoom(newValue[0]);
    } else if (typeof newValue === 'number') {
      this.zoom(newValue);
    }
  };

  private isValidZoom(zoomValue: number) {
    if (this.capabilities?.zoom && typeof zoomValue === 'number') {
      return zoomValue >= this.capabilities?.zoom?.min && zoomValue <= this.capabilities?.zoom?.max;
    }
  }

  public async scan(): Promise<MadOCRFunctionalLocations | undefined> {
    // handle scanning logic
    await this.capturePhoto();
    if (this.capture) {
      return await getFunctionalLocations(this.capture);
    } else {
      return undefined;
    }
  }
}

export { Camera };
