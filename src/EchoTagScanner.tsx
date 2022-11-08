import React, { memo, useEffect, useState } from 'react';
import { logger } from '@utils';
import { Viewfinder, Scanner as ScannerUI, ZoomTutorial } from '@ui';
import { ErrorBoundary } from '@services';
import { useGetMediastream } from '@hooks';
import styled from 'styled-components';
import { zIndexes } from '@const';
import { ViewfinderDimensions } from '@types';

const EchoCamera = () => {
  useEffect(() => {
    logger.moduleStarted();
  }, []);
  var viewFinderDimensions: ViewfinderDimensions | undefined = undefined;

  // The camera feed.
  const mediaStream = useGetMediastream();

  // Represets the camera viewfinder.
  const [viewfinder, setViewfinder] = useState<HTMLVideoElement>();

  // Used for postprocessing of captures.
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();

  // Whatever is inside this area is what will be the OCR target.
  const [scanningArea, setScanningArea] = useState<HTMLElement>();

  if (!mediaStream) {
    return null;
  }

  const videoTracks = mediaStream.getVideoTracks();
  if (videoTracks.length > 0) {
    viewFinderDimensions = {
      width: mediaStream.getVideoTracks()[0].getSettings().width,
      height: mediaStream.getVideoTracks()[0].getSettings().height
    };
  }

  return (
    <Main>
      <ErrorBoundary stackTraceEnabled>
        {viewFinderDimensions && (
          <Viewfinder
            setCanvasRef={setCanvas}
            setVideoRef={setViewfinder}
            setScanningAreaRef={setScanningArea}
            videoRef={viewfinder}
            dimensions={viewFinderDimensions}
          />
        )}

        {viewfinder && canvas && scanningArea && (
          <ScannerUI
            stream={mediaStream}
            viewfinder={viewfinder}
            canvas={canvas}
          />
        )}
        <ZoomTutorial />
      </ErrorBoundary>
    </Main>
  );
};

const Main = styled.main`
  position: relative;
  touch-action: none;
  height: 100%;
  width: 100%;
  z-index: ${zIndexes.viewfinder};
`;

export default memo(EchoCamera);
