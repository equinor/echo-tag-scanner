import { EchoModuleApi } from '@equinor/echo-core';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const setup = (api: EchoModuleApi) => {
  api.registerApp(() => <main>camera</main>, {
    homeScreen: true,
    exactPath: false
  });
};

export { setup };
