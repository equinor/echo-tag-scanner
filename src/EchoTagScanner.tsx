import React, { memo, useEffect, useState } from "react";
import { logger } from '@utils';
import {
  CameraCouldNotBeStartedAlert,
  Scanner as ScannerUI,
  StartingCameraLoading,
  Viewfinder,
  ZoomTutorial
} from '@ui';
import { ErrorBoundary } from '@services';
import { useGetMediastream } from '@hooks';
import styled from 'styled-components';
import { zIndexes } from '@const';

/**
 * This component will handle all of the initial React setup and renders before control is handed to the classes.
 * - It obtains a media stream by permission from the client.
 * - It sets all element refs
 * - Once the refs and media stream is ready, it will render the rest of the UI hierarchy.
 */
const EchoCamera = () => {
  useEffect(function onLoadTagScanner() {
    // Tag Scanner module is being logged as started.
    logger.moduleStarted();
  }, []);

  // The camera feed.
  const { mediaStream, mediaStreamRequestError, requestStatus } =
    useGetMediastream();

  // Represets the camera viewfinder.
  const [viewfinder, setViewfinder] = useState<HTMLVideoElement>();

  // Used for postprocessing of captures.
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();

  // Whatever is inside this area is what will be the OCR target.
  const [scanningArea, setScanningArea] = useState<HTMLElement>();

  if (
    mediaStreamRequestError instanceof OverconstrainedError ||
    (mediaStreamRequestError instanceof Error &&
      requestStatus === 'not allowed')
  ) {
    return <CameraCouldNotBeStartedAlert error={mediaStreamRequestError} />;
  }

  if (requestStatus === 'requesting') {
    return <StartingCameraLoading />;
  }

  // No need to render any kind of UI and long as we're waiting for the media stream.
  // This might be improved in the future by letting the user see some kind of camera shell.
  if (!mediaStream) {
    return null;
  }

  return (
    <ErrorBoundary stackTraceEnabled>
      <Main>
        <Viewfinder
          setCanvasRef={setCanvas}
          setVideoRef={setViewfinder}
          setScanningAreaRef={setScanningArea}
          videoRef={viewfinder}
        />

        <ManualPlay
          onClick={() => {
            viewfinder?.play();
          }}
        >
          Play
        </ManualPlay>

        {viewfinder && canvas && scanningArea && (
          <ScannerUI
            stream={mediaStream}
            viewfinder={viewfinder}
            canvas={canvas}
            scanningArea={scanningArea}
          />
        )}
        <ZoomTutorial />
      </Main>
    </ErrorBoundary>
  );
};

const ManualPlay = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  background-color: hotpink;
  z-index: 100;
  padding: 2rem;
`;

const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  touch-action: none;
  height: 100%;
  width: 100%;
  z-index: ${zIndexes.viewfinder};
`;

export default memo(EchoCamera);
