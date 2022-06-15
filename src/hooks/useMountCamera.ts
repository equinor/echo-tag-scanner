import { RefObject, useEffect, useRef } from 'react';
import { Camera } from '../core/Camera';
import { CameraProps } from '../core/CoreCamera';
import { assignZoomSettings } from '@utils';

type CameraInfrastructure = {
  camera: Camera;
  viewfinder: RefObject<HTMLVideoElement>;
  canvas: RefObject<HTMLCanvasElement>;
  zoomInput: RefObject<HTMLInputElement>;
  scanArea: RefObject<HTMLElement>;
};

export function useMountCamera(): CameraInfrastructure {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const scanAreaRef = useRef<HTMLElement>(null);
  const cameraRef = useRef<Camera>();

  // Instansiate the camera core class.
  useEffect(
    function mountCamera() {
      if (canvasRef.current != null && videoRef.current != null) {
        const props: CameraProps = {
          viewfinder: videoRef,
          canvas: canvasRef
        };

        cameraRef.current = new Camera(props);
      }

      // Setup the zoom slider with the min, max and step values.
      if (zoomInputRef?.current != null) {
        zoomInputRef.current.min = assignZoomSettings('min', cameraRef.current);
        zoomInputRef.current.max = assignZoomSettings('max', cameraRef.current);
        zoomInputRef.current.step = assignZoomSettings(
          'step',
          cameraRef.current
        );
        zoomInputRef.current.value = '1';
      }

      function cleanup() {
        if (cameraRef.current) {
          cameraRef.current.stopCamera();
        }
      }
      return cleanup;
    },
    [canvasRef.current]
  );

  // Handle multitouch events.
  videoRef?.current?.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  videoRef.current;

  return {
    camera: cameraRef?.current,
    canvas: canvasRef,
    viewfinder: videoRef,
    zoomInput: zoomInputRef,
    scanArea: scanAreaRef
  };
}
