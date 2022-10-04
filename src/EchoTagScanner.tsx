import React, { memo, useEffect, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import { OverconstrainedAlert, Viewfinder, Scanner as ScannerUI } from '@ui';
import { logger } from '@utils';
import { ErrorBoundary } from '@services';
import { TagScanner } from '@cameraLogic';
import styled from 'styled-components';

const useEffectAsync = EchoUtils.Hooks.useEffectAsync;

const EchoCamera = () => {
  useEffect(() => {
    logger.moduleStarted();
  }, []);

  const [stream, setStream] = useState<MediaStream | undefined>();
  const [overConstrainedCameraDetails, setoverConstrainedCameraDetails] =
    useState<OverconstrainedError | undefined>(undefined);

  // TODO: Move this to an external hook
  useEffectAsync(async () => {
    try {
      const mediaStream = await TagScanner.getMediastream();
      setStream(mediaStream);
    } catch (error) {
      if (error instanceof OverconstrainedError) {
        setoverConstrainedCameraDetails(error);
      } else if (
        error instanceof DOMException &&
        error.name === 'NotAllowedError'
      ) {
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
        // !isDevelopment && globalThis.history.back();
      }
    }
  }, []);

  // Represets the camera viewfinder.
  const [viewfinder, setViewfinder] = useState<HTMLVideoElement>();
  // Used for postprocessing of captures.
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();

  if (!stream) {
    return null;
  }

  const dimensions = {
    width: stream.getVideoTracks()[0].getSettings().width,
    height: stream.getVideoTracks()[0].getSettings().height
  };

  return (
    <Main>
      <ErrorBoundary stackTraceEnabled>
        <Viewfinder
          setCanvasRef={setCanvas}
          setVideoRef={setViewfinder}
          videoRef={viewfinder}
          dimensions={dimensions}
        />

        {viewfinder && canvas && (
          <ScannerUI stream={stream} viewfinder={viewfinder} canvas={canvas} />
        )}
      </ErrorBoundary>
    </Main>
  );
};

const Main = styled.main`
  display: flex;
  background-color: black;
  justify-content: center;
  align-items: center;
  touch-action: none;
  height: 100vh;
  width: 100vw;
`;

export default memo(EchoCamera);
