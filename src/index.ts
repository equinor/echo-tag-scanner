import { EchoModuleApi, analytics } from '@equinor/echo-core';
import { logger } from '@utils';
import { App } from './App';

export function setup(api: EchoModuleApi): void {
  api.registerApp(App, { homeScreen: true, exactPath: false });
}
