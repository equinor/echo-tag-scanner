import EchoFramework, { SetActiveTagNo } from '@equinor/echo-framework';

import { logger } from '@utils';

export function useSetActiveTagNo() {
  try {
    return EchoFramework.Hooks.useSetActiveTagNo();
  } catch (error) {
    const setActiveTagNo: SetActiveTagNo = (tagNo) => {
      logger.log('LocalDevelopment', () =>
        console.warn(
          'SetActiveTagNo does not work locally. Here is the tagNo: ',
          tagNo
        )
      );
    };

    return setActiveTagNo;
  }
}
