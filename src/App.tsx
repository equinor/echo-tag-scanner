import React, { FC } from 'react';
import { EchoCamera } from './EchoCamera';
import { ErrorBoundary } from '@services';

const App: FC = () => {
  return (
    <ErrorBoundary stackTraceEnabled>
      <EchoCamera />
    </ErrorBoundary>
  );
};

export { App };
