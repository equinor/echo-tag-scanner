import { FC, useRef, useEffect } from 'react';
import styles from './styles.less';
import { Camera, CameraProps } from './core/Camera';
import { CameraControls, Viewfinder, ZoomSlider } from '@components';
import { NotificationHandler } from '@services';
import { getNotificationDispatcher, extractFunctionalLocation } from '@utils';
import EchoFramework from '@equinor/echo-framework';

const EchoCamera: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<Camera>();
  const tagSearch = EchoFramework.Hooks.useSetActiveTagNo();

  // Instansiate the camera core class.
  useEffect(
    function mountCamera() {
      console.log('mounting');
      const props: CameraProps = {
        viewfinder: videoRef,
        canvas: canvasRef
      };
      cameraRef.current = new Camera(props);
    },
    // Needs to monitor .current for correct behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cameraRef.current]
  );

  // Setup the zoom slider with the min, max and step values.
  useEffect(
    function setupZoom() {
      if (zoomInputRef?.current != null && cameraRef?.current != null) {
        zoomInputRef.current.min = assignZoomSettings('min');
        zoomInputRef.current.max = assignZoomSettings('max');
        zoomInputRef.current.step = assignZoomSettings('step');
        zoomInputRef.current.value = assignZoomSettings('value');
        zoomInputRef.current.oninput = cameraRef.current?.alterZoom;
      }
    },
    // Needs to monitor .current for correct behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zoomInputRef.current]
  );

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
      const tagNumbers = await cameraRef.current.scan();
      if (
        tagNumbers &&
        Array.isArrayextractFunctionalLocation(tagNumbers?.results) &&
        tagNumbers.results.length > 0
      ) {
        // TODO: Handle multiple OCR results.
        const extract = extractFunctionalLocation(tagNumbers.results[0]);
        if (extract.tagNumber) {
          tagSearch(extract.tagNumber);
          getNotificationDispatcher(tagNumbers?.results.toString())();
        }
      } else {
        getNotificationDispatcher('We did not recognize any tag numbers.')();
      }
    }
  };

  function provideTorchToggling() {
    const onToggleTorch = () => {
      if (cameraRef?.current != null) {
        cameraRef.current.toggleTorch();
      }
    };

    const onToggleUnsupportedTorch = () => {
      getNotificationDispatcher('The torch is not supported on this device.');
    };

    if (cameraRef?.current != null) {
      if (cameraRef?.current.capabilities?.zoom) {
        return onToggleTorch;
      } else {
        return onToggleUnsupportedTorch;
      }
    }
  }

  if (cameraRef?.current) {
    return (
      <main className={styles.cameraWrapper}>
        <Viewfinder canvasRef={canvasRef} videoRef={videoRef} />

        <ZoomSlider
          zoomInputRef={zoomInputRef}
          zoomOptions={cameraRef?.current?.capabilities?.zoom}
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
