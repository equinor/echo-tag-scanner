import { analytics, AnalyticsEvent, AnalyticsModule } from '@equinor/echo-core';
import echomodule from '../../echoModule.config.json';

export enum ObjectName {
  Module = 'Module',
  Scanner = 'Scanner'
}

type ActionNames = {
  [ObjectName.Module]: ModuleActions;
  [ObjectName.Scanner]: ScannerActions;
};

type ActionProperties = {
  [ObjectName.Module]: ModuleActionProperties;
  [ObjectName.Scanner]: ScannerActionsProperties;
};

type ModuleActions = 'Started';
type ModuleActionProperties = {
  message?: string;
};

type ScannerActions = 'DoneScanning';
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

  public log(level: LogLevelKeys, callback: Function): void {
    if (this._logLevel > LogLevel[level]) return;
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

interface EchoTagScannnerLoggerProps extends BaseLoggerProps {
  moduleName: string;
  moduleShortName: string;
}
class EchoTagScannnerLogger extends BaseLogger {
  private _moduleName: string;
  private _moduleShortName: string;

  constructor({
    moduleName,
    moduleShortName,
    ...baseProps
  }: EchoTagScannnerLoggerProps) {
    super(baseProps);
    this._moduleName = moduleName;
    this._moduleShortName = moduleShortName;
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

  public doneScanning(props: ScannerActionsProperties) {
    this.trackEvent(ObjectName.Scanner, 'DoneScanning', props);
  }
}

const moduleShortName = echomodule.manifest.shortName;
const moduleName = echomodule.manifest.name;

const overrideLogLevel = localStorage.getItem(`${moduleShortName}.logOverride`);
const logger = new EchoTagScannnerLogger({
  moduleName,
  moduleShortName,
  analytics: analytics.createAnalyticsModule(moduleShortName),
  logLevelOverride: overrideLogLevel ? Number(overrideLogLevel) : undefined
});

export { logger };
