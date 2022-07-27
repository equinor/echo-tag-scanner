import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';

import { TagScanner } from '../core/Scanner';
import { CameraProps } from '@types';
import { assignZoomSettings } from '@utils';

type CameraInfrastructure = {
  tagScanner: TagScanner;
  setZoomInputRef: Dispatch<SetStateAction<HTMLInputElement>>;
};

const { useEffectAsync } = EchoUtils.Hooks;
export function useMountScanner(
  viewfinder: HTMLVideoElement,
  canvas: HTMLCanvasElement
): CameraInfrastructure {
  // Zoom controls. Currently only Android.
  const [zoomRef, setZoomInputRef] = useState<HTMLInputElement>(null);
  const [tagScanner, setCamera] = useState<TagScanner | undefined>(undefined);

  useEffectAsync(async (signal) => {
    const mediaStream = await TagScanner.promptCameraUsage();

    const props: CameraProps = {
      mediaStream,
      viewfinder,
      canvas
    };
    const camera = new TagScanner(props);

    if (!signal.aborted) {
      setCamera(camera);
    }

    return () => {
      console.info('stopping camera');
      camera.stopCamera();
    };
  }, []);

  // Handling zoom assignments
  useEffect(() => {
    if (!tagScanner) return;
    if (zoomRef === null) return;

    // Setup the zoom slider with the min, max and step values.
    zoomRef.min = assignZoomSettings('min', tagScanner);
    zoomRef.max = assignZoomSettings('max', tagScanner);
    zoomRef.step = assignZoomSettings('step', tagScanner);
    zoomRef.value = '1';
  }, [tagScanner, zoomRef]);

  // Handle multitouch events.
  viewfinder.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  return {
    tagScanner,
    setZoomInputRef
  };
}
