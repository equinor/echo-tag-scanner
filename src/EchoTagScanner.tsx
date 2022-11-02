import React, { memo, useEffect, useState } from 'react';
import { Viewfinder, Scanner as ScannerUI } from '@ui';
import { logger } from '@utils';
import { ErrorBoundary } from '@services';
import { useGetMediastream } from '@hooks';
import styled from 'styled-components';

const EchoCamera = () => {
  useEffect(() => {
    logger.moduleStarted();
  }, []);
  // The camera feed.
  const mediaStream = useGetMediastream();
  // Represets the camera viewfinder.
  const [viewfinder, setViewfinder] = useState<HTMLVideoElement>();
  // Used for postprocessing of captures.
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();

  if (!mediaStream) {
    return null;
  }

  const dimensions = {
    width: mediaStream.getVideoTracks()[0].getSettings().width,
    height: mediaStream.getVideoTracks()[0].getSettings().height
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
          <ScannerUI
            stream={mediaStream}
            viewfinder={viewfinder}
            canvas={canvas}
          />
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
