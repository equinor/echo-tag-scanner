import { useState, useEffect, FC } from 'react';
import { Route, Switch, Redirect, BrowserRouter } from 'react-router-dom';
import EchoCore from '@equinor/echo-core';
import { EchoCamera } from './EchoCamera';

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
          <EchoCamera />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export { App };
