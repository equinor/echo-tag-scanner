import { AnalyticsEvent, AnalyticsModule } from '@equinor/echo-core';

export enum ObjectName {
  Module = 'Module',
  Dashboard = 'Dashboard',
  Comment = 'Comment'
}

type ActionNames = {
  [ObjectName.Module]: ModuleActions;
  [ObjectName.Dashboard]: DashboardActions;
  [ObjectName.Comment]: CommentActions;
};

type ActionProperties = {
  [ObjectName.Module]: ModuleActionProperties;
  [ObjectName.Dashboard]: DashboardActionProperties;
  [ObjectName.Comment]: CommentActionProperties;
};

type ModuleActions = 'Started';
type ModuleActionProperties = {
  message?: string;
};

type DashboardActions = 'SelectDrawing';
type DashboardActionProperties = {
  cardId: number;
};

type CommentActions = 'Opened' | 'Closed';
type CommentActionProperties = {
  commentId: number;
};

class Logger {
  private active: boolean;
  private logLevel: number;
  private analytics?: AnalyticsModule;

  constructor() {
    this.active = true;
    // loglevel handling?
    this.logLevel = 0;

    // The analytics could be configured -- not sure how to do that yet.
  }

  public setAnalytics(analytics: AnalyticsModule): void {
    // Do we have analytics?
    this.analytics = analytics;
  }

  public trackEvent<
    Name extends ObjectName = ObjectName,
    Action extends ActionNames[Name] = ActionNames[Name],
    Properties extends ActionProperties[Name] = ActionProperties[Name]
  >(objectName: Name, actionName: Action, properties: Properties): void {
    const event = this.analytics?.createEventLog(
      objectName,
      actionName,
      properties
    );
    if (event) {
      this.track(event);
    }
  }

  public track(event: AnalyticsEvent): void {
    this.analytics?.trackEvent(event);
  }

  public trackError(error: Error): void {
    this.analytics?.logError(error);
  }

  public info(...params: any[]): void {
    this.log('info', ...params);
  }

  public warn(...params: any[]): void {
    this.log('warn', ...params);
  }

  public error(...params: any[]): void {
    this.log('error', ...params);
  }

  private log(logType: 'info' | 'warn' | 'error', ...params: any[]) {
    if (this.active) {
      switch (logType) {
        case 'info':
          console.info(...params);
          break;
        case 'warn':
          console.warn(...params);
          break;
        case 'error':
          console.error(...params);
          break;
        default:
          throw new Error("No matching 'logType' found in Logger.log.");
      }
    }
  }
}

const logger = new Logger();

export { logger };
