import { useState, useEffect } from 'react';
import { Syncer } from '@equinor/echo-search';

/**
 * Returns a boolean indicating if echo is syncing the tags in IndexedDB.
 */
function useEchoIsSyncing(): boolean {
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

  return echoIsSyncing;
}

export { useEchoIsSyncing };
