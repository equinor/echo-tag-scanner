import { useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import { TagScanner } from '../cameraLogic/scanner';
import { CameraProps } from '@types';
import { deviceInformationAgent, isProduction, logger } from '@utils';
import { Debugger } from '../cameraLogic/debugger';

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
    const props: CameraProps = {
      mediaStream: stream,
      viewfinder,
      canvas,
      scanningArea,
      deviceInformation: deviceInformationAgent.deviceInformation
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
