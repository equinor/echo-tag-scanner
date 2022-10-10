import React, { memo, useEffect, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import { OverconstrainedAlert, ScanningArea, Viewfinder } from '@components';
import {
  logger,
  getNotificationDispatcher as dispatchNotification,
  isLocalDevelopment,
  getOrientation
} from '@utils';
import { ErrorBoundary } from '@services';
import { TagScanner } from './core/Scanner';
import { Scanner } from './components/ScannerUI';
import { Backdrop } from '@components';
import styled from 'styled-components';
import { useOrientation } from './hooks';

const useEffectAsync = EchoUtils.Hooks.useEffectAsync;

const EchoCamera = () => {
  useEffect(() => {
    logger.moduleStarted();
  }, []);

  const [stream, setStream] = useState<MediaStream | undefined>();
  const [overConstrainedCameraDetails, setoverConstrainedCameraDetails] =
    useState<OverconstrainedError | undefined>(undefined);
  const orientation = useOrientation();

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

  if (isLocalDevelopment) {
    return (
      <Wrapper>
        <BottomBarMain>
          <ErrorBoundary stackTraceEnabled>
            <Viewfinder canvasRef={setCanvas} videoRef={setViewfinder} />
            <ScanningArea captureAreaRef={setScanArea} />

            {viewfinder && canvas && scanArea && (
              <Scanner
                stream={stream}
                viewfinder={viewfinder}
                canvas={canvas}
                scanArea={scanArea}
              />
            )}
          </ErrorBoundary>
        </BottomBarMain>
        {isLocalDevelopment && orientation === 'landscape' && (
          <MockEchoSidebar id="mock-sidebar">
            Sidebar placeholder
          </MockEchoSidebar>
        )}
        {isLocalDevelopment && orientation === 'portrait' && (
          <MockEchoBottomBar id="mock-bottombar">
            Bottom bar placeholder
          </MockEchoBottomBar>
        )}
      </Wrapper>
    );
  }

  return (
    <>
      <Main>
        <ErrorBoundary stackTraceEnabled>
          <Viewfinder canvasRef={setCanvas} videoRef={setViewfinder} />
          <ScanningArea captureAreaRef={setScanArea} />

          {viewfinder && canvas && scanArea && (
            <Scanner
              stream={stream}
              viewfinder={viewfinder}
              canvas={canvas}
              scanArea={scanArea}
            />
          )}
        </ErrorBoundary>
      </Main>
    </>
  );
};

const BottomBarMain = styled.main`
  position: relative;
  touch-action: none;
  height: calc(100% - 48px);
  width: 100%;

  @media screen and (orientation: landscape) {
    height: 100%;
    width: calc(100% - 56px);
  }
`;

const Main = styled.main`
  position: relative;
  touch-action: none;
  height: 100%;
  width: 100%;
  z-index: 1;
`;

const MockEchoBottomBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 100%;
  height: 48px;
  z-index: 1445;

  @media screen and (orientation: landscape) {
    height: 100%;
    width: 56px;
  }
`;

const MockEchoSidebar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 56px;
  height: 100%;
  z-index: 1445;
  writing-mode: vertical-lr;
`;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;

  @media screen and (orientation: landscape) {
    flex-direction: row-reverse;
  }
`;

export default EchoCamera;
