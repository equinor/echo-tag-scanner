import { useState, useEffect, FC } from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import EchoCore from '@equinor/echo-core';
import { EchoCamera } from './EchoCamera';
import { ErrorBoundary } from './services';

const App: FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (EchoCore.EchoAuthProvider.isAuthenticated) {
        setIsAuthenticated(true);
      } else {
        EchoCore.EchoAuthProvider.handleLogin().then(() => {
          if (EchoCore.EchoAuthProvider.isAuthenticated) {
            setIsAuthenticated(true);
          }
        });
      }
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Switch>
        <Route>
          <ErrorBoundary stackTraceEnabled>
            <EchoCamera />
          </ErrorBoundary>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export { App };
