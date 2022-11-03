import React, { memo, useEffect, useState } from 'react';
import { Viewfinder, Scanner as ScannerUI } from '@ui';
import { logger, getOrientation, isLocalDevelopment } from '@utils';
import { ErrorBoundary } from '@services';
import { useGetMediastream } from '@hooks';
import styled from 'styled-components';
import { zIndexes } from '@const';

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
  const orientation = useOrientation();

  if (!mediaStream) {
    return null;
  }

  const dimensions = {
    width: mediaStream.getVideoTracks()[0].getSettings().width,
    height: mediaStream.getVideoTracks()[0].getSettings().height
  };

  return (
    <Wrapper>
      <Main>
        <ErrorBoundary stackTraceEnabled>
          <Viewfinder
            setCanvasRef={setCanvas}
            setVideoRef={setViewfinder}
            setScanningAreaRef={setScanningArea}
            videoRef={viewfinder}
            dimensions={dimensions}
          />

          {viewfinder && canvas && scanningArea && (
            <ScannerUI
              stream={mediaStream}
              viewfinder={viewfinder}
              canvas={canvas}
            />
          )}
        </ErrorBoundary>
      </Main>
      {isLocalDevelopment && orientation === 'landscape' && (
        <MockEchoSidebar id="mock-sidebar">Sidebar placeholder</MockEchoSidebar>
      )}
      {isLocalDevelopment && orientation === 'portrait' && (
        <MockEchoBottomBar id="mock-bottombar">
          Bottom bar placeholder
        </MockEchoBottomBar>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  @media screen and (orientation: landscape) {
    flex-direction: row-reverse;
  }
`;

const Main = styled.main`
  position: relative;
  touch-action: none;
  height: calc(100% - 46px);
  width: 100%;
  z-index: ${zIndexes.viewfinder};
`;

const MockEchoBottomBar = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 100vw;
  height: var(--echo-bottom-bar-height);
  z-index: ${zIndexes.echoBottombar};
`;

const MockEchoSidebar = styled.div`
  position: fixed;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  width: var(--echo-sidebar-width);
  height: 100vh;
  z-index: ${zIndexes.echoBottombar};
  writing-mode: vertical-lr;
`;

export function useOrientation() {
  const [currentOrientation, setOrientation] = useState<
    'landscape' | 'portrait'
  >(getOrientation());

  useEffect(function mount() {
    const handleChange = () => {
      setOrientation(getOrientation());
    };

    window.addEventListener('resize', () => handleChange());
    return window.removeEventListener('resize', () => handleChange());
  }, []);

  return currentOrientation;
}

export default memo(EchoCamera);
