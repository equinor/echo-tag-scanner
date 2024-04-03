import { useState } from 'react';

import { deviceInfo, useEffectAsync } from '@equinor/echo-utils';

import { ScannerProps } from '@types';
import { isProduction } from '@utils';
import { AzureOCRv2 } from '@services';

import { TagScanner } from '../cameraLogic/scanner';
import { Debugger } from '../cameraLogic/debugger';

type CameraInfrastructure = {
  tagScanner?: TagScanner;
};

export function useMountScanner(
  viewfinder: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  stream: MediaStream,
  scanningArea: HTMLElement
): CameraInfrastructure {
  const [tagScanner, setCamera] = useState<TagScanner | undefined>(undefined);

  useEffectAsync(async (signal) => {
    const props: ScannerProps = {
      mediaStream: stream,
      viewfinder,
      canvas,
      deviceInformation: deviceInfo,
      scanningArea,
      ocrService: new AzureOCRv2()
    };

    const camera = new TagScanner(props);

    if (!signal.aborted) {
      setCamera(camera);

      !isProduction && Debugger.startupLogs(camera);
    }

    return () => {
      camera.stopCamera();
    };
  }, []);

  return {
    tagScanner
  };
}
