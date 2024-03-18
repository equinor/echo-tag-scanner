import React, { memo, useEffect, useState } from 'react';
import { logger } from '@utils';
import {
  CameraCouldNotBeStartedAlert,
  Scanner as ScannerUI,
  StartingCameraLoading,
  Viewfinder,
  ZoomTutorial
} from '@ui';
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
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
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
    <Main>
      <Viewfinder
        setCanvasRef={setCanvas}
        setVideoRef={setViewfinder}
        setScanningAreaRef={setScanningArea}
        videoRef={viewfinder}
      />

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
  );
};

const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  touch-action: none;
  height: 100%;
  width: 100%;
  z-index: ${zIndexes.viewfinder};
  font-family: var(--eq-echo-font-family), Equinor, sans-serif;
`;

export default memo(EchoCamera);
