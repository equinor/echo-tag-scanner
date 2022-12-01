import { useState } from 'react';
import { TagScanner } from '@cameraLogic';
import EchoUtils from '@equinor/echo-utils';
import { logger } from '@utils';

export function useGetMediastream(): MediaStream | undefined {
  const [stream, setStream] = useState<MediaStream | undefined>();

  EchoUtils.Hooks.useEffectAsync(async () => {
    try {
      const mediaStream = await TagScanner.getMediastream();
      setStream(mediaStream);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        logger.log('QA', () => {
          console.error('We do not have access to your camera.');
          console.error(
            'Check your browser settings that ' +
              globalThis.location.href +
              ' is not blacklisted and that you are running with HTTPS.'
          );
        });
        // This didn't quite work because browsers might "remember" the
        // denial and the results is that the users are instantly navigated back.
        //  !isDevelopment && globalThis.history.back();
      } else if (error instanceof Error) {
        throw new Error(error.toString());
      }
    }
  }, []);
  return stream;
}
