import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';
import { TagScanner } from '../cameraLogic/scanner';
import { CameraProps, ZoomSteps } from '@types';
import { zoomSteps } from '@const';

type CameraInfrastructure = {
  tagScanner?: TagScanner;
  setZoomInputRef: Dispatch<SetStateAction<HTMLInputElement | undefined>>;
};

const { useEffectAsync } = EchoUtils.Hooks;
export function useMountScanner(
  viewfinder: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  stream: MediaStream
): CameraInfrastructure {
  // Zoom controls. Currently only Android.
  const [zoomRef, setZoomInputRef] = useState<HTMLInputElement>();
  const [tagScanner, setCamera] = useState<TagScanner | undefined>(undefined);
  const [zoom, setZoom] = useState<ZoomSteps | undefined>(undefined);

  useEffectAsync(async (signal) => {
    const props: CameraProps = {
      mediaStream: stream,
      viewfinder,
      canvas
    };
    const camera = new TagScanner(props);

    if (!signal.aborted) {
      setCamera(camera);
      setZoom(camera.zoom);
    }

    return () => {
      camera.stopCamera();
    };
  }, []);

  // Handling zoom assignments
  useEffect(() => {
    if (!tagScanner) return;
    if (zoomRef == null) return;

    // Setup the zoom slider with the min, max and step values.
    zoomRef.min = String(zoomSteps[0]);
    zoomRef.max = String(zoomSteps.at(-1));
    zoomRef.step = '1';
    zoomRef.value = String(zoom);
  }, [tagScanner, zoomRef, zoom]);

  return {
    tagScanner,
    setZoomInputRef
  };
}
