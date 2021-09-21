import { render } from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@equinor/echo-framework/dist/index.css';
import EchoCore from '@equinor/echo-core';
import { startup } from '@equinor/echo-framework';
import './index.css';

async function start() {
  try {
    await EchoCore.EchoAuthProvider.handleLogin();
    await startup();
    render(<App />, document.getElementById('root'));
  } catch (error) {
    throw error;
  }
}

start()
  .then(() => {
    console.info('Echo Camera Web started successfully.');
    if (!window.location.href.includes('camera')) {
      console.info('Redirecting to basepath');
      window.location.href = '/camera';
    }
    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  })
  .catch((e) => console.error('Echo Camera Web failed to start', e));
