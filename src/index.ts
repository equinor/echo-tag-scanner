import { EchoModuleApi, analytics } from '@equinor/echo-core';
import { logger } from '@utils';
import { App } from './App';

export function setup(api: EchoModuleApi): void {
  const ECanalytics = analytics.createAnalyticsModule('ec');
  logger.setAnalytics(ECanalytics);
  api.registerApp(App, { homeScreen: true, exactPath: false });
}
