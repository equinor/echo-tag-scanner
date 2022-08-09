import { useState, useEffect } from 'react';

import { Syncer } from '@equinor/echo-search';

function useEchoIsSyncing() {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const offlineSystem = Syncer.OfflineSystem.Tags;
    const unsubscribeFunction = Syncer.syncStates
      .getSyncStateBy(offlineSystem)
      .progressPercentage.subscribe((currentProgress) => {
        setProgress(currentProgress);
      });

    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, []);

  console.log('Current progress -> ', progress);
  return progress === 100;
}

export { useEchoIsSyncing };
