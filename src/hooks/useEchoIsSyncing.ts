import { useState, useEffect } from 'react';
import { Syncer } from '@equinor/echo-search';
import { EchoEnv } from '@equinor/echo-core';

/**
 * Returns a boolean indicating if echo is syncing the tags in IndexedDB.
 * @param {boolean} isSynced Indicate if the sync process is already done.
 */
function useEchoIsSyncing(isSynced: boolean) {
  const offlineSystem = Syncer.OfflineSystem.Tags;
  const [tagsAreDoneSyncing, setTagsAreDoneSyncing] = useState(
    Syncer.syncStates.getSyncStateBy(offlineSystem).isSyncing.getValue()
  );
  useEffect(() => {
    const unsubscribeFunction = Syncer.syncStates
      .getSyncStateBy(offlineSystem)
      .progressPercentage.subscribe((currentProgress) => {
        setTagsAreDoneSyncing(currentProgress === 100);
      });

    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, [offlineSystem]);

  if (EchoEnv.isDevelopment()) {
    return true;
  } else {
    return tagsAreDoneSyncing;
  }
}

export { useEchoIsSyncing };
