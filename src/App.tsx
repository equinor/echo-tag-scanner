import React, { Suspense } from 'react';

import { DialogGenerator } from '@equinor/echo-components';
import { Dialog, Progress } from '@equinor/eds-core-react';

// import EchoCamera from './EchoCamera';
const LazyCamera = React.lazy(() => import('./EchoCamera'));

const FallbackLoading = (): JSX.Element => {
  return (
    <DialogGenerator title="Loading..." actionButtons={[]} open>
      <Dialog.CustomContent>
        <Progress.Circular
          style={{ margin: 'auto', display: 'block !important' }}
        />
      </Dialog.CustomContent>
    </DialogGenerator>
  );
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<FallbackLoading />}>
      <LazyCamera />
    </Suspense>
  );
};

export { App };
