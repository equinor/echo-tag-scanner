import React, { useRef } from 'react';
import styled from 'styled-components';

import { ScanningArea, Viewfinder } from '@components';

import { Scanner } from './Scanner';

const EchoCamera = () => {
  // Represets the camera viewfinder.
  const viewfinder = useRef<HTMLVideoElement>(null);
  // Used for postprocessing of captures.
  const canvas = useRef<HTMLCanvasElement>(null);
  // All tags within this bounding box will be scanned.
  const scanArea = useRef<HTMLElement>(null);

  return (
    <Main>
      <Viewfinder canvasRef={canvas} videoRef={viewfinder} />
      <ScanningArea captureAreaRef={scanArea} />

      {viewfinder.current && canvas.current && scanArea.current && (
        <Scanner
          viewfinder={viewfinder.current}
          canvas={canvas.current}
          scanArea={scanArea.current}
        />
      )}
    </Main>
  );
};

const Main = styled.main`
  .cameraWrapper {
    height: 100%;
  }
`;

export { EchoCamera };
