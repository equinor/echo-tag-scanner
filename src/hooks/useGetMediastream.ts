import { useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import { getCameraPreferences, logger } from '@utils';

type RequestStatus = 'requesting' | 'not allowed' | 'allowed';

type Payload = {
  mediaStream?: MediaStream;
  mediaStreamRequestError?: Error;
  requestStatus: RequestStatus;
};

export function useGetMediastream(): Payload {
  const [mediaStream, setStream] = useState<MediaStream | undefined>();
  const [mediaStreamRequestError, setError] = useState<Error | undefined>();
  const [requestStatus, setRequestStatus] =
    useState<RequestStatus>('requesting');

  EchoUtils.Hooks.useEffectAsync(async () => {
    try {
      const cameraPreferences = getCameraPreferences();
      const stream = await navigator.mediaDevices.getUserMedia(
        cameraPreferences
      );
      setStream(stream);
      setRequestStatus('allowed');
    } catch (cameraRequestError) {
      if (cameraRequestError instanceof OverconstrainedError) {
        setError(cameraRequestError);
        setRequestStatus('not allowed');
        logger.trackError(cameraRequestError);
      } else if (cameraRequestError instanceof Error) {
        const cameraAccessNotGrantedError = new Error(
          'Camera could not be started.',
          {
            cause:
              'Camera does not exist, is being used somewhere else or Echo is not granted permission to access the camera in browser settings.'
          }
        );
        setError(cameraAccessNotGrantedError);
        setRequestStatus('not allowed');
        logger.trackError(cameraAccessNotGrantedError);
      }
    }
  }, []);
  return { mediaStream, mediaStreamRequestError, requestStatus };
}
