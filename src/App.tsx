import React, { useState, useEffect, FC } from 'react';
import EchoCore from '@equinor/echo-core';
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
