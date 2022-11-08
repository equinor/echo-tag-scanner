import { useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import { TagScanner } from '../cameraLogic/scanner';
import { CameraProps } from '@types';

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
      scanningArea
    };
    const camera = new TagScanner(props);

    if (!signal.aborted) {
      setCamera(camera);
    }

    return () => {
      camera.stopCamera();
    };
  }, []);

  return {
    tagScanner
  };
}
