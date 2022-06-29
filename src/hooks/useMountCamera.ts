import { RefObject, useEffect, useRef } from 'react';
import { TagScanner } from '../core/Scanner';
import { CameraProps } from '../core/CoreCamera';
import { assignZoomSettings } from '@utils';

type CameraInfrastructure = {
  tagScanner: TagScanner;
  viewfinder: RefObject<HTMLVideoElement>;
  canvas: RefObject<HTMLCanvasElement>;
  zoomInput: RefObject<HTMLInputElement>;
  scanArea: RefObject<HTMLElement>;
};

export function useMountScanner(): CameraInfrastructure {
  // Represets the camera viewfinder.
  const videoRef = useRef<HTMLVideoElement>(null);

  // Used for postprocessing of captures.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zoom controls. Currently only Android.
  const zoomInputRef = useRef<HTMLInputElement>(null);

  // All tags within this bounding box will be scanned.
  const scanAreaRef = useRef<HTMLElement>(null);
  const cameraRef = useRef<TagScanner>();

  useEffect(
    function mountCamera() {
      if (canvasRef.current != null && videoRef.current != null) {
        const props: CameraProps = {
          viewfinder: videoRef,
          canvas: canvasRef
        };

        if (cameraRef.current == null) {
          TagScanner.construct(props)
            .then((tagScanner: TagScanner) => {
              cameraRef.current = tagScanner;

              // Setup the zoom slider with the min, max and step values.
              if (zoomInputRef?.current != null) {
                zoomInputRef.current.min = assignZoomSettings(
                  'min',
                  cameraRef.current
                );
                zoomInputRef.current.max = assignZoomSettings(
                  'max',
                  cameraRef.current
                );
                zoomInputRef.current.step = assignZoomSettings(
                  'step',
                  cameraRef.current
                );
                zoomInputRef.current.value = '1';
              }
            })
            .catch((reason) =>
              console.error(
                'Something went wrong when constructing the camera.',
                reason
              )
            );
        }
      }

      function cleanup() {
        if (cameraRef.current) {
          cameraRef.current.stopCamera();
          //TODO: Do a full cleanup. In production, the exit action is just navigation.
        }
      }
      return cleanup;
    },
    [canvasRef.current, videoRef.current]
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

  return {
    tagScanner: cameraRef?.current,
    canvas: canvasRef,
    viewfinder: videoRef,
    zoomInput: zoomInputRef,
    scanArea: scanAreaRef
  };
}
