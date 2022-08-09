import { useState, useEffect } from 'react';

import { Syncer } from '@equinor/echo-search';

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
    const offlineSystem = Syncer.OfflineSystem.Tags;
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
  }, []);

  console.log('Tags are done syncing -> ', tagsAreDoneSyncing);
  return tagsAreDoneSyncing;
}

export { useEchoIsSyncing };
