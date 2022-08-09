import { useState } from 'react';

import { EchoEnv, eventHub } from '@equinor/echo-core';
import EchoUtils from '@equinor/echo-utils';
import { logger } from '@utils';

function useEchoIsSyncing() {
  const [tagSyncIsDone, setTagSyncIsDone] = useState(false);
  EchoUtils.Hooks.useEffectAsync(async (signal) => {
    // When Echo is done syncing, we can rerender and open for scanning.
    const unsubscribe = eventHub.subscribe(
      'isSyncing',
      (isSyncing: boolean) => {
        logger.log('Info', () => console.log('Echo is syncing: ', isSyncing));
        if (signal.aborted) return;

        if (!isSyncing) {
          logger.log('Info', () => console.log('Echo is syncing: ', isSyncing));
          setTagSyncIsDone(true);
        }
      }
    );

    // Since we do not have tag syncing in development, this will mimick an interval where Echopedia is syncing.
    if (EchoEnv.isDevelopment()) {
      const syncDelayMs = 2000;
      setTimeout(() => {
        if (signal.aborted) return;
        setTagSyncIsDone(true);
      }, syncDelayMs);
    }

    return () => unsubscribe();
  }, []);

  return tagSyncIsDone;
}

export { useEchoIsSyncing };
