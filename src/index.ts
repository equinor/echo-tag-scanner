import { EchoModuleApi } from '@equinor/echo-core';
import { App } from './App';

export function setup(api: EchoModuleApi): void {
  api.registerApp(App, { homeScreen: true, exactPath: false });
}
