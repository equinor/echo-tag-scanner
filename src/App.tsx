import React, { FC } from 'react';
import { EchoCamera } from './EchoCamera';
import { ErrorBoundary } from '@services';

const App: FC = () => {
  return (
    <main>
      <ErrorBoundary stackTraceEnabled>
        <EchoCamera />
      </ErrorBoundary>
    </main>
  );
};

export { App };
