import { EchoModuleApi } from '@equinor/echo-core';
import { Search } from '@equinor/echo-search';
import { App } from './App';

/**
 * Accepts a possible tag number as string value and runs it through Echo Search for validation.
 */
async function findClosestTag(testers: string) {
  Search.Tags.closestTagAsync(testers)
    .then((res) => {
      if (res.isNotFound) console.warn('Could not find match for ' + testers);
      else console.info(`${testers} corrected to ${res.value}`);
    })
    .catch((reason) => console.error(reason));
}

globalThis.echoSearch = findClosestTag;

export function setup(api: EchoModuleApi): void {
  api.registerApp(App, { homeScreen: true, exactPath: false });
}
