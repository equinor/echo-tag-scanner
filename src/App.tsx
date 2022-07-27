import React, { Suspense } from 'react';

import { DialogGenerator } from '@equinor/echo-components';
import { Dialog, Progress } from '@equinor/eds-core-react';

import { ErrorBoundary } from '@services';

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
    <main>
      <ErrorBoundary stackTraceEnabled>
        <Suspense fallback={<FallbackLoading />}>
          <LazyCamera />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
};

export { App };
