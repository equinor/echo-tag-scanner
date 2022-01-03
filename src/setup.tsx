import React from 'react';
import { EchoModuleApi } from '@equinor/echo-core';
import { App } from './App';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const setup = (api: EchoModuleApi) => {
  api.registerApp(() => <App />, {
    homeScreen: true,
    exactPath: false
  });
};

export { setup };
