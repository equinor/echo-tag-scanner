import { EchoModuleApi } from '@equinor/echo-core';
import { App } from './App';
import { getTagsAndSaveToFile } from '@utils';

export function setup(api: EchoModuleApi): void {
  globalThis.saveTagsToFile = getTagsAndSaveToFile;
  api.registerApp(App, { homeScreen: true, exactPath: false });
}
