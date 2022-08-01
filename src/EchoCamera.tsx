import React, { useEffect, useRef } from 'react';

import { ScanningArea, Viewfinder } from '@components';
import { logger, ObjectName } from '@utils';

import { Scanner } from './Scanner';

const EchoCamera = () => {
  useEffect(() => {
    logger.ModuleStarted();
  }, []);

  // Represets the camera viewfinder.
  const viewfinder = useRef<HTMLVideoElement>(null);
  // Used for postprocessing of captures.
  const canvas = useRef<HTMLCanvasElement>(null);
  // All tags within this bounding box will be scanned.
  const scanArea = useRef<HTMLElement>(null);

  return (
    <>
      <Viewfinder canvasRef={canvas} videoRef={viewfinder} />
      <ScanningArea captureAreaRef={scanArea} />

      {viewfinder.current && canvas.current && scanArea.current && (
        <Scanner
          viewfinder={viewfinder.current}
          canvas={canvas.current}
          scanArea={scanArea.current}
        />
      )}
    </>
  );
};

export { EchoCamera };
export default EchoCamera;
