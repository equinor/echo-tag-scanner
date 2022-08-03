import EchoFramework from '@equinor/echo-framework';

import { logger } from '@utils';

export function useSetActiveTagNo() {
  try {
    return EchoFramework.Hooks.useSetActiveTagNo();
  } catch (error) {
    return (tagNo: string) => {
      logger.log('Warning', () =>
        console.warn(
          'SetActiveTagNo does not work locally. Here is the tagNo: ',
          tagNo
        )
      );
    };
  }
}
