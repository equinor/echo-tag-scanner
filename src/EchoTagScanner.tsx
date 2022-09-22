import React, { memo, useEffect, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import {
  OverconstrainedAlert,
  ScanningArea,
  Viewfinder,
  Scanner as ScannerUI
} from '@ui';
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

  useEffectAsync(async () => {
    try {
      const mediaStream = await TagScanner.getMediastream();
      // mediaStream.addEventListener('removetrack', test);
      setStream(mediaStream);
      // return mediaStream.removeEventListener('removetrack', test);
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
  // All tags within this bounding box will be scanned.
  const [scanArea, setScanArea] = useState<HTMLElement>();

  if (overConstrainedCameraDetails) {
    return (
      <OverconstrainedAlert technicalInfo={overConstrainedCameraDetails} />
    );
  }

  if (overConstrainedCameraDetails) {
    return (
      <OverconstrainedAlert technicalInfo={overConstrainedCameraDetails} />
    );
  }

  if (!stream) {
    return null;
  }

  return (
    <Main>
      <ErrorBoundary stackTraceEnabled>
        <Viewfinder canvasRef={setCanvas} videoRef={setViewfinder} />
        <ScanningArea captureAreaRef={setScanArea} />

        {viewfinder && canvas && scanArea && (
          <ScannerUI
            stream={stream}
            viewfinder={viewfinder}
            canvas={canvas}
            scanArea={scanArea}
          />
        )}
      </ErrorBoundary>
    </Main>
  );
};

const Main = styled.main`
  touch-action: none;
  height: 100vh;
  width: 100vw;
`;

export default memo(EchoCamera);
