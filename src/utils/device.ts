import { DeviceInformation } from '@types';
import UAParser from 'ua-parser-js';

interface DeviceInformationProps {
  deviceInformation: DeviceInformation;
  uaDataValues: UADataValues | null;
  uaParser: UAParser;
}

/**
 * This object is concerned with gathering and holding information about the users device.
 * This object will be read-only after initialization and should as a rule throw errors if the
 * deviceInformation property is altered after intialization.
 */
class DeviceInformationAgent {
  /** Represents the user agent string parser.
   * This method is treated as a fallback if the User-Agent Client Hints API does not provide a coherent value
   * or if the browser does not yet support it.
   */
  private readonly _uaParser: UAParser;

  /**
   * Stores the system report from a call to the underlying system.
   * - If this is undefined, it is not yet initialized (it happens asynchronously).
   * - If this is null, it probably means the browser have no support for User-Agent Client Hints API.
   */
  private readonly _uaDataValues: UADataValues | undefined | null = undefined;

  /** Holds the current device information and should be the single source of truth.
   *
   * It can be undefined because we have to asynchronously fetch underlying system information.
   */
  private readonly _deviceInformation: DeviceInformation | undefined =
    undefined;

  private constructor(props: DeviceInformationProps) {
    this._deviceInformation = props.deviceInformation;
    this._uaDataValues = props.uaDataValues;
    this._uaParser = props.uaParser;
  }

  public get deviceInformation(): DeviceInformation {
    if (this._deviceInformation === undefined)
      throw new Error(
        "Device information is undefined. This might mean it hasn't been initialized yet."
      );
    return this._deviceInformation;
  }

  public get uaDataValues() {
    return this._uaDataValues;
  }

  public get uaParser() {
    return this._uaParser;
  }

  /** Asyncronously constructs the agent and returns it.  */
  public static async initialize(): Promise<DeviceInformationAgent> {
    // Assign essentially an alias for readability.
    const DIA = DeviceInformationAgent;

    const uaDataValues =
      (await navigator.userAgentData?.getHighEntropyValues([
        'architecture',
        'model',
        'bitness',
        'platformVersion',
        'uaFullVersion',
        'fullVersionList'
      ])) ?? null; // We reassign to a null to make a distinction between "not yet initialized" or "not available".

    const uaParser = new UAParser(navigator.userAgent);
    let deviceInformation: DeviceInformation | undefined;

    // User-Agent Client Hints API is not supported.
    if (uaDataValues === null) {
      deviceInformation = {
        deviceModel: DIA.getDeviceModel(uaParser) ?? 'Device model not found.',
        operatingSystem:
          DIA.getOperatingSystem(uaParser) ?? 'Operating system not found.',
        webBrowser: DIA.getWebBrowser(uaParser) ?? 'Web browser not found'
      };

      // Call constructor and return the thin-air object.
      return new DIA({
        deviceInformation: deviceInformation,
        uaDataValues: uaDataValues,
        uaParser: uaParser
      });
    }

    //User-Agent Client Hints API is supported and initialized, so use it with optional partial fallbacks.
    let webBrowser = DIA.getWebBrowser(uaDataValues);
    if (webBrowser.length === 0) webBrowser = DIA.getWebBrowser(uaParser);

    let operatingSystem = DIA.getOperatingSystem(uaDataValues);
    if (operatingSystem.length === 0)
      operatingSystem = DIA.getOperatingSystem(uaParser);

    let deviceModel = DIA.getDeviceModel(uaDataValues);
    if (deviceModel.length === 0) deviceModel = DIA.getDeviceModel(uaParser);

    deviceInformation = {
      webBrowser: webBrowser || 'Web browser not found.',
      operatingSystem: operatingSystem || 'Operating system not found.',
      deviceModel: deviceModel || 'Device model not found.'
    } as DeviceInformation;

    // Call constructor and return the thin-air object.
    return new DIA({
      deviceInformation: deviceInformation,
      uaDataValues: uaDataValues,
      uaParser: uaParser
    });
  }

  private static getWebBrowser(dataOrigin: UAParser | UADataValues): string {
    if (dataOrigin instanceof UAParser) {
      const { name, version } = dataOrigin.getBrowser();
      if (!name && !version) return '';
      return `${name} ${version}`;
    }

    const browsers = dataOrigin.brands;
    if (browsers?.length === 0) return '';
    let browserNameVersion = '';

    browsers?.forEach(
      (browser) =>
        (browserNameVersion += `${browser.brand} ${browser.version};`)
    );

    return browserNameVersion;
  }

  private static getOperatingSystem(
    dataOrigin: UAParser | UADataValues
  ): string {
    if (dataOrigin instanceof UAParser) {
      const { name, version } = dataOrigin.getOS();
      if (!name && !version) return '';
      return `${name} ${version}`;
    }

    const os = dataOrigin.platform;
    const osVersion = dataOrigin.platformVersion;
    if (!os && !osVersion) return '';
    return `${os} ${osVersion}`;
  }

  private static getDeviceModel(dataOrigin: UAParser | UADataValues): string {
    if (dataOrigin instanceof UAParser) {
      const { model, vendor } = dataOrigin.getDevice();
      if (!model && !vendor) return '';
      return `${model} ${vendor}`;
    }

    return dataOrigin.model ?? '';
  }
}

export const deviceInformationAgent = await DeviceInformationAgent.initialize();
