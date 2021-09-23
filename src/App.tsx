import { useState, useEffect, FC } from 'react';
import { Route, Switch, Redirect, BrowserRouter } from 'react-router-dom';
import EchoCore from '@equinor/echo-core';
import { STIDCamera } from './STIDCamera';

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

  const tempCloseCameraCallback = () => {
    console.log('i like fishes');
  };

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/camera">
          <STIDCamera closeCamera={tempCloseCameraCallback} />
        </Route>
        <Route path="/*" render={() => <Redirect to="/camera" />} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
