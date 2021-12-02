import { CoreCamera, CoreCameraProps } from './CoreCamera';
import { getNotificationDispatcher } from '@utils';
import { doScanning } from '@services';

export type CameraProps = CoreCameraProps;

class Camera extends CoreCamera {
  private _torchState = false;
  private _scanningNotification = getNotificationDispatcher(
    'Placeholder for scanning notification.'
  );

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

  public alterZoom = (ev: Event): void => {
    // Not sure why Event.prototype.target.value is not resolved at compile time.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const numberedZoom = Number(ev.target.value);
    if (typeof numberedZoom === 'number' && ev.target && this.isValidZoom(numberedZoom)) {
      this.zoom(numberedZoom);
    }
  };

  private isValidZoom(zoomValue: number) {
    if (this.capabilities?.zoom) {
      return zoomValue >= this.capabilities?.zoom?.min && zoomValue <= this.capabilities?.zoom?.max;
    }
  }

  public async scan(): Promise<void> {
    // handle scanning logic
    this._scanningNotification();
    await doScanning();
  }
}

export { Camera };
