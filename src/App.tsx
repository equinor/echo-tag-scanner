import React, { Suspense } from 'react';
import { DialogGenerator } from '@equinor/echo-components';
import { Dialog, Progress } from '@equinor/eds-core-react';
import './vars.css';
import {
  DeviceInformation,
  DetailedDeviceInformationProvider
} from '@equinor/echo-framework';

const ddi = DetailedDeviceInformationProvider.initialize();
globalThis.ddi = ddi;
globalThis.deviceInfo = new DeviceInformation({ detailedDeviceInfo: ddi });

const FallbackLoading = (): JSX.Element => {
  return (
    <DialogGenerator
      title="Loading Echo Tag Scanner..."
      actionButtons={[]}
      open
    >
      <Dialog.CustomContent style={{ textAlign: 'center' }}>
        <Progress.Circular
          style={{ margin: 'auto', display: 'block !important' }}
        />
      </Dialog.CustomContent>
    </DialogGenerator>
  );
};

const LazyScanner = React.lazy(() => import('./EchoTagScanner'));
const LazyLoadedTagScanner: React.FC = () => {
  return (
    <Suspense fallback={<FallbackLoading />}>
      <LazyScanner />
    </Suspense>
  );
};

export { LazyLoadedTagScanner as App };
