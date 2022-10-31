import React, { memo, useEffect, useState } from 'react';
import { Viewfinder, Scanner as ScannerUI } from '@ui';
import { logger } from '@utils';
import { ErrorBoundary } from '@services';
import { useGetMediastream } from '@hooks';
import styled from 'styled-components';

type ScanningAreaCoords = {
  x: number;
  y: number;
};

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

  // Whatever is inside this area is what will be the OCR target.
  const [scanningArea, setScanningArea] = useState<HTMLElement>();
  const [scanningAreaCoordinates, setCoordinates] = useState<
    ScanningAreaCoords | undefined
  >();

  useEffect(() => {
    if (scanningArea instanceof HTMLElement) {
      const rect = scanningArea.getBoundingClientRect();
      setCoordinates({ x: rect.x, y: rect.y });
    }
  }, [scanningArea]);

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
          setScanningAreaRef={setScanningArea}
          videoRef={viewfinder}
          dimensions={dimensions}
        />
        {scanningAreaCoordinates && (
          <ScanningAreaCoordinates
            x={scanningAreaCoordinates.x}
            y={scanningAreaCoordinates.y}
          >
            ({scanningAreaCoordinates.x}, {scanningAreaCoordinates.y})
          </ScanningAreaCoordinates>
        )}

        {viewfinder && canvas && scanningArea && (
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

const ScanningAreaCoordinates = styled.output<ScanningAreaCoords>`
  position: absolute;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  z-index: 10;
  color: hotpink;
  font-weight: bold;
`;

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
