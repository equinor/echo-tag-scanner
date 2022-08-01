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
  Track = 1,
  Error,
  Warning,
  Info,
  Verbose
}

type LogLevelKeys = keyof typeof LogLevel;

type LoggerProps = {
  analytics: AnalyticsModule;
  logLevelOverride?: LogLevel;
};
class BaseLogger {
  protected logLevelOverride?: LogLevel;
  protected analytics: AnalyticsModule;

  constructor({ analytics, logLevelOverride }: LoggerProps) {
    this.analytics = analytics;
    this.logLevelOverride = logLevelOverride;
  }

  public track(event: AnalyticsEvent): void {
    if (this.logLevel() <= LogLevel.Track) return;
    this.analytics.trackEvent(event);
  }

  public trackError(error: Error): void {
    if (this.logLevel() <= LogLevel.Track) return;
    this.analytics.logError(error);
  }

  public log(level: LogLevelKeys, callback: Function): void {
    if (this.logLevel() < LogLevel[level]) return;
    callback();
  }

  /**
   *
   * @returns LogLevel for current hosting environment.
   */
  protected logLevel(): LogLevel {
    const location = globalThis.location;
    const modulePath = echomodule.manifest.path;

    // We only log things when module path matches our module
    if (!location.pathname.includes(modulePath)) return;

    if (
      location.host === 'echo.equinor.com' ||
      location.host === 'dt-echopedia-web-dev.azurewebsites.net' ||
      location.host === 'dt-echopedia-web-qa.azurewebsites.net' ||
      location.host === 'dt-echopedia-web-test.azurewebsites.net'
    ) {
      // FIXME: We could in theory also console.log errors here. Not sure.
      // return LogLevel.Error
      return LogLevel.Track;
    }

    if (location.host === 'localhost:3000') {
      return LogLevel.Verbose;
    }

    return LogLevel.Error;
  }
}

class EchoTagScannnerLogger extends BaseLogger {
  public trackEvent<
    Name extends ObjectName = ObjectName,
    Action extends ActionNames[Name] = ActionNames[Name],
    Properties extends ActionProperties[Name] = ActionProperties[Name]
  >(objectName: Name, actionName: Action, properties: Properties): void {
    const event = this.analytics.createEventLog(
      objectName,
      actionName,
      properties
    );
    if (event) {
      this.track(event);
    }
  }
}

const moduleShortName = echomodule.manifest.shortName;
const overrideLogLevel = localStorage.getItem(`${moduleShortName}.logOverride`);
const logger = new EchoTagScannnerLogger({
  analytics: analytics.createAnalyticsModule(moduleShortName),
  logLevelOverride: overrideLogLevel ? Number(overrideLogLevel) : undefined
});

export { logger };
