import { DeviceInformation } from '@types';
import { deviceInformationAgent } from './device';

// Use these types once Screen Orientation API is production ready in Safari.
type ScreenOrientationFuture = typeof ScreenOrientation.prototype.type;

/** If the viewport is square, for example 300x300, the orientation is then portrait. */
type ScreenOrientation = 'portrait' | 'landscape';
type DeviceType = 'mobile' | 'tablet' | 'desktop';
type UserInput = 'touch' | 'mouse';
type ScreenDimensions = { width: number; height: number };

interface IDeviceSummary {
  deviceType: DeviceType;
  userInput: UserInput;
  screenOrientation: ScreenOrientation;
  screenDimensions: ScreenDimensions;
  deepDeviceInformation: DeviceInformation;
}

export class DeviceSummary {
  public deviceSummary: IDeviceSummary;
  private _orientation: ScreenOrientation;
  private _deviceType: DeviceType;
  private _userInput: UserInput;
  private _orientationIsLandscapeQuery: MediaQueryList;

  constructor() {
    this._userInput = this.getUserInput();
    this._deviceType = this.getDeviceType();
    this._orientationIsLandscapeQuery = globalThis.matchMedia(
      '(orientation: landscape)'
    );
    this._orientation = this.getOrientation();
    this._orientationIsLandscapeQuery.addEventListener(
      'change',
      this.updateOrientation.bind(this)
    );
    this.deviceSummary = this.getSummary();
  }

  public getSummary(): IDeviceSummary {
    this.deviceSummary = {
      deviceType: this._deviceType,
      screenOrientation: this._orientation,
      userInput: this._userInput,
      screenDimensions: this.getUpdatedScreenDimensions(),
      deepDeviceInformation: Object.freeze(
        deviceInformationAgent.deviceInformation
      )
    };

    return this.deviceSummary;
  }

  private getUpdatedScreenDimensions(): ScreenDimensions {
    return {
      width: screen?.width ?? globalThis.innerWidth,
      height: screen?.height ?? globalThis.innerHeight
    };
  }

  private getUserInput() {
    const usingTouchQuery = globalThis.matchMedia('(pointer: coarse)');
    return usingTouchQuery.matches ? 'touch' : 'mouse';
  }

  /** Returns the current viewing medium.*/
  private getDeviceType(): DeviceType {
    const deviceInfo = deviceInformationAgent.deviceInformation;

    // Find iDevices
    if (deviceInfo.deviceModel === 'iPad Apple') return 'tablet';
    if (deviceInfo.deviceModel === 'iPhone Apple') return 'mobile';
    if (deviceInfo.platform === 'MacOs') return 'desktop';

    // Find Android phones.
    if (deviceInfo.platform === 'Android') return 'mobile';

    // Find Windows desktops.
    // Implementers should note users will have touch screens on Windows desktop devices.
    if (deviceInfo.platform === 'Windows') return 'desktop';

    // Find Linux desktops with mouse inputs.
    // A clash with Android mobile or tablet is a possibility.
    if (deviceInfo.platform === 'Linux' && this._userInput === 'mouse')
      return 'desktop';

    return 'desktop';
  }

  private getOrientation(): ScreenOrientation {
    if (this._orientationIsLandscapeQuery.matches) return 'landscape';
    else return 'portrait';
  }

  private updateOrientation() {
    if (this._orientationIsLandscapeQuery.matches)
      this._orientation = 'landscape';
    else this._orientation = 'portrait';
  }
}

export const deviceSummary = new DeviceSummary();
