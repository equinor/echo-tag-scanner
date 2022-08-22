import { useState, useEffect } from 'react';
import { Syncer } from '@equinor/echo-search';
import { logger } from '@utils';

/**
 * Returns a boolean indicating if echo is syncing the tags in IndexedDB.
 */
function useEchoIsSyncing() {
  const [echoIsSyncing, setEchoIsSyncing] = useState(
    Syncer.syncStates
      .getSyncStateBy(Syncer.OfflineSystem.Tags)
      .isSyncing.getValue()
  );

  useEffect(() => {
    const unsubscribeFunction = Syncer.syncStates
      .getSyncStateBy(Syncer.OfflineSystem.Tags)
      .progressPercentage.subscribe((currentProgress) => {
        setEchoIsSyncing(currentProgress !== 100);
      });

    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, []);

  logger.log('EchoDevelopment', () =>
    console.info('Echo is syncing ->', echoIsSyncing)
  );
  return echoIsSyncing;
}

export { useEchoIsSyncing };
