import { useState } from 'react';

import EchoUtils from '@equinor/echo-utils';

import { ScannerProps } from '@types';
import { deviceInformationAgent, isProduction } from '@utils';

import { TagScanner } from '../cameraLogic/scanner';
import { Debugger } from '../cameraLogic/debugger';
import { OCR } from '../cameraLogic';

type CameraInfrastructure = {
  tagScanner?: TagScanner;
};

const { useEffectAsync } = EchoUtils.Hooks;
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
      deviceInformation: deviceInformationAgent.deviceInformation,
      scanningArea,
      ocrService: new OCR()
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
