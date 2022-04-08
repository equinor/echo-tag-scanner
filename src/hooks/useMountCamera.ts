import { RefObject, useRef } from 'react';
import { Camera, CameraProps } from '../core/Camera';
import { assignZoomSettings } from '@utils';

type CameraInfrastructure = {
  camera: Camera;
  viewfinder: RefObject<HTMLVideoElement>;
  canvas: RefObject<HTMLCanvasElement>;
  zoomInput: RefObject<HTMLInputElement>;
};

export function useMountCamera(): CameraInfrastructure {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const props: CameraProps = {
    viewfinder: videoRef,
    canvas: canvasRef
  };
  const cameraRef = useRef<Camera>(new Camera(props));

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

  // Setup the zoom slider with the min, max and step values.
  if (zoomInputRef?.current != null) {
    zoomInputRef.current.min = assignZoomSettings('min', cameraRef.current);
    zoomInputRef.current.max = assignZoomSettings('max', cameraRef.current);
    zoomInputRef.current.step = assignZoomSettings('step', cameraRef.current);
    zoomInputRef.current.value = '1';
  }

  // Turn off camera once user is navigating away.
  globalThis.addEventListener('pagehide', () => {
    cameraRef.current.stopCamera();
  });

  return {
    camera: cameraRef.current,
    canvas: canvasRef,
    viewfinder: videoRef,
    zoomInput: zoomInputRef
  };
}
