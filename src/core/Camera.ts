import { CoreCamera, CoreCameraProps } from './CoreCamera';
import { getNotificationDispatcher } from '@utils';
import { getFunctionalLocations } from '@services';
import { MadOCRFunctionalLocations } from '@types';

export type CameraProps = CoreCameraProps;

class Camera extends CoreCamera {
  private _torchState = false;
  private _scanningNotification = getNotificationDispatcher('Scanning...');

  constructor(props: CameraProps) {
    super(props);
  }

  public toggleTorch = (): void => {
    try {
      this._torchState = !this._torchState;
      this.torch(this._torchState);
    } catch (error) {
      console.log(error);
    }
  };

  public alterZoom = (ev: React.FormEvent<HTMLDivElement>, newValue: number | number[]): void => {
    if (typeof newValue === 'number' && ev.target && this.isValidZoom(newValue)) {
      this.zoom(newValue);
    }

    // TODO: Handle zoom errors
  };

  private isValidZoom(zoomValue: number) {
    if (this.capabilities?.zoom && typeof zoomValue === 'number') {
      return zoomValue >= this.capabilities?.zoom?.min && zoomValue <= this.capabilities?.zoom?.max;
    }
  }

  public async scan(): Promise<MadOCRFunctionalLocations | undefined> {
    // handle scanning logic
    this._scanningNotification();
    await this.capturePhoto();

    if (this.capture) {
      return await getFunctionalLocations(this.capture);
    } else {
      return undefined;
    }
  }
}

export { Camera };
