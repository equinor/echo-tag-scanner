import { useState, useEffect, FC } from 'react';
import { Route, Switch, Redirect, BrowserRouter } from 'react-router-dom';
import EchoCore from '@equinor/echo-core';

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
        <Route exact path="/camera">
          <main>Camera</main>
        </Route>
        <Route path="/*" render={() => <Redirect to="/camera" />} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
