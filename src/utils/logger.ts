import {
  analytics,
  analyticsConfiguration,
  AnalyticsEvent,
  AnalyticsModule,
  EchoSettings
} from '@equinor/echo-core';
import echomodule from '../../echoModule.config.json';
import {
  DeviceInformation,
  FlatScanAttemptLogEntry,
  OCRPayload,
  ScanAttemptLogEntry,
  Timers
} from '@types';
import { Debugger, TagScanner } from '@cameraLogic';

export enum ObjectName {
  Module = 'Module',
  DoneScanning = 'Scanner',
  ScanAttempt = 'Scan'
}

type ActionNames = {
  [ObjectName.Module]: ModuleActions;
  [ObjectName.DoneScanning]: ScannerActions;
  [ObjectName.ScanAttempt]: ScannerActions;
};

type ActionProperties = {
  [ObjectName.Module]: ModuleActionProperties;
  [ObjectName.DoneScanning]: ScannerActionsProperties;
  [ObjectName.ScanAttempt]: FlatScanAttemptLogEntry;
};

type ModuleActions = 'Started';
type ModuleActionProperties = {
  message?: string;
};

type ScannerActions = 'DoneScanning' | 'ScanAttempt';
type ScannerActionsProperties = {
  seconds: number;
  found: number;
};

enum LogLevel {
  Invalid = 0,
  LocalDevelopment,
  EchoDevelopment,
  QA,
  Prod
}
type LogLevelKeys = keyof typeof LogLevel;

interface BaseLoggerProps {
  analytics: AnalyticsModule;
  /**
   * LogLevelOverride can be set in localstorage as "[moduleShortName].logOverride"
   * and should be a number between 0 and 5.
   */
  logLevelOverride?: LogLevel;
}
class BaseLogger {
  protected _logLevel: LogLevel;
  protected _logLevelOverride?: LogLevel;
  protected _analytics: AnalyticsModule;

  constructor({ analytics, logLevelOverride }: BaseLoggerProps) {
    this._analytics = analytics;
    this._logLevelOverride = logLevelOverride;
    this._logLevel = this.setInitialLogLevel();
  }

  public set overrideLogLevel(override: LogLevelKeys) {
    globalThis.localStorage.setItem(
      `${echomodule.manifest.shortName}.logOverride`,
      String(override)
    );
  }

  public getLogLevelOverride() {
    const overriddenLevel = Number(
      globalThis.localStorage.getItem(
        `${echomodule.manifest.shortName}.logOverride`
      )
    );
  }

  public track(event: AnalyticsEvent): void {
    if (this._logLevel !== LogLevel.Prod) return;
    this._analytics.trackEvent(event);
  }

  public trackError(error: Error): void {
    if (this._logLevel !== LogLevel.Prod) return;
    this._analytics.logError(error);
  }

  public log(incomingLevel: LogLevelKeys, callback: Function): void {
    if (this._logLevel > LogLevel[incomingLevel]) return;
    callback();
  }

  /**
   * @returns LogLevel for current hosting environment.
   */
  protected setInitialLogLevel(): LogLevel {
    const location = globalThis.location;
    const modulePath = echomodule.manifest.path;

    // We only log things when module path matches our module
    if (!location.pathname.includes(modulePath)) return LogLevel.Invalid;

    // Production
    if (location.host === 'echo.equinor.com') return LogLevel.Prod;

    // Quality assurance
    if (
      location.host === 'dt-echopedia-web-qa.azurewebsites.net' ||
      location.host === 'dt-echopedia-web-test.azurewebsites.net'
    )
      return LogLevel.QA;

    // Remote development
    if (location.host === 'dt-echopedia-web-dev.azurewebsites.net') {
      return LogLevel.EchoDevelopment;
    }

    // Local development
    if (
      location.host.includes('localhost') ||
      location.host.includes('loca.lt')
    ) {
      return LogLevel.LocalDevelopment;
    }

    return LogLevel.Invalid;
  }
}

interface EchoTagScannerLoggerProps extends BaseLoggerProps {
  moduleName: string;
  moduleShortName: string;
}
class EchoTagScannerLogger extends BaseLogger {
  private _moduleName: string;
  private _moduleShortName: string;

  constructor({
    moduleName,
    moduleShortName,
    ...baseProps
  }: EchoTagScannerLoggerProps) {
    super(baseProps);
    this._moduleName = moduleName;
    this._moduleShortName = moduleShortName;
    analyticsConfiguration.setInstCode(
      EchoSettings.getSettings().plantSettings.instCode
    );
  }

  public trackEvent<
    Name extends ObjectName = ObjectName,
    Action extends ActionNames[Name] = ActionNames[Name],
    Properties extends ActionProperties[Name] = ActionProperties[Name]
  >(objectName: Name, actionName: Action, properties: Properties): void {
    const event = this._analytics.createEventLog(
      objectName,
      actionName,
      properties
    );
    if (event) {
      this.track(event);
    }
  }

  public moduleStarted() {
    this.trackEvent(ObjectName.Module, 'Started', {
      message: this._moduleName + ' has started.'
    });
  }

  public scanAttempt(logPayload: ScanAttemptLogEntry) {
    const flattenedLogEntry = {
      ...logPayload.deviceInformation,
      ...logPayload.deviceUsage,
      ...logPayload.ocrPayload,
      ...logPayload.timers
    } as FlatScanAttemptLogEntry;
    Debugger.reportLogEntry(flattenedLogEntry);
    this.trackEvent(ObjectName.ScanAttempt, 'ScanAttempt', flattenedLogEntry);
  }
}

const moduleShortName = echomodule.manifest.shortName;
const moduleName = echomodule.manifest.name;

const overrideLogLevel = localStorage.getItem(`${moduleShortName}.logOverride`);
const logger = new EchoTagScannerLogger({
  moduleName,
  moduleShortName,
  analytics: analytics.createAnalyticsModule(moduleShortName),
  logLevelOverride: overrideLogLevel ? Number(overrideLogLevel) : undefined
});

/**
 * Accepts a result from the OCR step and merges it to a ScanAttempt log entry alongside information about the scanning session
 *  before relaying to AppInsights.
 */
function logScanningAttempt(
  this: TagScanner,
  ocrResult?: OCRPayload,
  timers?: Timers
): ScanAttemptLogEntry {
  const deviceDetails = this.deviceInformation.getDeviceDetails();
  const deviceInformation: DeviceInformation = {
    deviceModel: deviceDetails.deviceModel,
    operatingSystem: deviceDetails.operatingSystem,
    webBrowser: deviceDetails.webBrowser,
    platform:
      deviceDetails.platform === 'Platform not found'
        ? undefined
        : deviceDetails.platform
  };

  let logEntry: ScanAttemptLogEntry = {
    timers: timers,
    ocrPayload: ocrResult,
    deviceInformation: deviceInformation,
    deviceUsage: {
      cameraResolution: `${this.videoTrackSettings?.width}x${this.videoTrackSettings?.height}@${this.videoTrackSettings?.frameRate}`,
      zoomMethod: this.zoomMethod.type,
      zoomValue: this.zoom,
      deviceOrientation: this.currentOrientation
    }
  };
  if (logEntry?.ocrPayload) {
    Reflect.deleteProperty(logEntry.ocrPayload, 'timeTaken');
  }
  logger.scanAttempt(logEntry);

  return logEntry;
}

export { logger, logScanningAttempt };
