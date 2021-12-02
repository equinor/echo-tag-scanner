import { FC, useRef, useEffect } from 'react';
import styles from './styles.less';
import { Camera, CameraProps } from './state/Camera';
import { CameraControls, Viewfinder, ZoomSlider } from '@components';
import { NotificationHandler } from '@services';

const EchoCamera: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<Camera>();

  // Instansiate the camera core class.
  useEffect(
    function mountCamera() {
      const props: CameraProps = {
        viewfinder: videoRef
      };
      cameraRef.current = new Camera(props);
    },
    [cameraRef]
  );

  // Setup the zoom slider with the min, max and step values.
  useEffect(function setupZoom() {
    if (zoomInputRef?.current != null && cameraRef?.current != null) {
      zoomInputRef.current.min = assignZoomSettings('min');
      zoomInputRef.current.max = assignZoomSettings('max');
      zoomInputRef.current.step = assignZoomSettings('step');
      zoomInputRef.current.value = assignZoomSettings('value');
      zoomInputRef.current.oninput = cameraRef.current?.alterZoom;
    }
  });

  function assignZoomSettings(type: 'min' | 'max' | 'step' | 'value'): string {
    if (cameraRef?.current != null) {
      const camera = cameraRef.current;
      if (type === 'value') {
        if (camera.settings?.zoom) {
          return String(camera.settings.zoom);
        } else {
          return '1';
        }
      }
      if (camera.capabilities?.zoom) {
        if (camera.capabilities.zoom[type]) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return String(camera.zoom[type]);
        }
      }
    }
    // If zoom capabilities does not exist, we need to return a stringified zero
    // to prevent a stringified undefined to be assigned to the zoom slider.
    return '0';
  }

  const onScanning = async () => {
    if (cameraRef?.current != null) {
      cameraRef.current.scan();
    }
  };

  function provideTorchToggling() {
    const onToggleTorch = () => {
      if (cameraRef?.current != null) {
        cameraRef.current.toggleTorch();
      }
    };

    if (cameraRef?.current != null) {
      if (cameraRef?.current.capabilities?.zoom) {
        return onToggleTorch;
      } else {
        return undefined;
      }
    }
  }

  if (cameraRef?.current) {
    return (
      <main className={styles.cameraWrapper}>
        <Viewfinder canvasRef={canvasRef} videoRef={videoRef} />

        <ZoomSlider
          zoomInputRef={zoomInputRef}
          deviceZoomCapable={Boolean(cameraRef?.current?.capabilities?.zoom)}
        />

        <CameraControls onToggleTorch={provideTorchToggling()} onScanning={onScanning} />
        <NotificationHandler />
      </main>
    );
  } else {
    return null;
  }
};

export { EchoCamera };
