import { FC, useRef, useEffect, useState } from 'react';
import styles from './styles.less';
import { useCameraState } from './state/useCameraState';
import { CameraControls, Viewfinder, Toast, ZoomSlider } from '@components';
import { ExtendedMediaTrackSupportedConstraints } from '@types';
import { NotificationHandler } from '@services';
import { getNotificationDispatcher } from '@utils';

const EchoCamera: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const { state, toggleTorch } = useCameraState(videoRef, canvasRef, zoomInputRef);
  const capabilities: ExtendedMediaTrackSupportedConstraints =
    navigator.mediaDevices.getSupportedConstraints();
  const dispatchScanningNotification = getNotificationDispatcher(
    'Placeholder for scanning notification.'
  );
  const dispatchTorchNotFound = getNotificationDispatcher(
    'The torch is not available on this device.'
  );

  useEffect(() => {
    if (!state.showCarousel && videoRef?.current) {
      videoRef.current.srcObject = state.mediaStream;
    }
  }, [state.mediaStream, state.showCarousel]);

  const onScanning = () => {
    dispatchScanningNotification();
  };

  const onToggleTorch = () => {
    const toggleStatus = toggleTorch();
    if (!toggleStatus) {
      dispatchTorchNotFound();
    }
  };

  return (
    <main className={styles.cameraWrapper}>
      <Viewfinder canvasRef={canvasRef} videoRef={videoRef} />

      <ZoomSlider zoomInputRef={zoomInputRef} deviceZoomCapable={capabilities.zoom} />

      <CameraControls
        onToggleTorch={onToggleTorch}
        onScanning={onScanning}
        capabilities={capabilities}
      />
      <NotificationHandler />
    </main>
  );
};

export { EchoCamera };
