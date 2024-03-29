import { EchoModuleApi } from '@equinor/echo-core';
import { Search } from '@equinor/echo-search';
import { App } from './App';
import { isProduction } from '@utils';

/**
 * Accepts a possible tag number as string value and runs it through Echo Search for validation.
 */
async function findClosestTag(testers: string) {
  Search.Tags.closestTagAsync(testers)
    .then((res) => {
      if (res.isNotFound) console.warn('Could not find match for ' + testers);
      else console.info(`${testers} corrected to ${res.value}`);

      console.table(res);
    })
    .catch((reason) => console.error(reason));
}

// Enable Echo-Search validation isolated test.
if (!isProduction) globalThis.echoSearch = findClosestTag;

export function setup(api: EchoModuleApi): void {
  api.registerApp(App, { homeScreen: true, exactPath: false });
}
