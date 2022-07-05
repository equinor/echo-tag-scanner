import { RefObject, useEffect, useRef, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';

import { TagScanner } from '../core/Scanner';
import { CameraProps } from '../core/CoreCamera';
import { assignZoomSettings } from '@utils';

type CameraInfrastructure = {
  tagScanner: TagScanner;
  zoomInput: RefObject<HTMLInputElement>;
};

const { useEffectAsync } = EchoUtils.Hooks;
export function useMountScanner(
  viewfinder: RefObject<HTMLVideoElement>,
  canvas: RefObject<HTMLCanvasElement>,
  scanArea: RefObject<HTMLElement>
): CameraInfrastructure {
  // Zoom controls. Currently only Android.
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<TagScanner | undefined>(undefined);

  useEffectAsync(async (signal) => {
    const props: CameraProps = {
      viewfinder,
      canvas
    };

    try {
      const camera = await TagScanner.construct(props);
      // Setup the zoom slider with the min, max and step values.
      if (zoomInputRef?.current != null) {
        zoomInputRef.current.min = assignZoomSettings('min', camera);
        zoomInputRef.current.max = assignZoomSettings('max', camera);
        zoomInputRef.current.step = assignZoomSettings('step', camera);
        zoomInputRef.current.value = '1';
      }

      if (!signal.aborted) {
        setCamera(camera);
      }

      return () => {
        console.info('stopping camera');
        camera.stopCamera();
      };
    } catch (reason) {
      console.error(
        'Something went wrong when constructing the camera.',
        reason
      );
    }
  }, []);

  // Handle multitouch events.
  viewfinder.current?.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  return {
    tagScanner: camera,
    zoomInput: zoomInputRef
  };
}
