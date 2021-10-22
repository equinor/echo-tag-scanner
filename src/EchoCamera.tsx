import { FC, useRef, useEffect } from 'react';
import styles from './styles.less';
import { useCameraState } from './state/useCameraState';
import { CameraControls, Viewfinder, ZoomSlider } from '@components';
import { ExtendedMediaTrackSupportedConstraints } from '@types';
import { NotificationHandler, doScanning } from '@services';
import { getNotificationDispatcher } from '@utils';
import EchoCore from '@equinor/echo-core';

const EchoCamera: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const { state, toggleTorch, clientCapability } = useCameraState(
    videoRef,
    canvasRef,
    zoomInputRef
  );
  const state2 = EchoCore.moduleState.useAppModuleState(state);
  console.log('%c⧭', 'color: #733d00', state2);
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

  const onScanning = async () => {
    dispatchScanningNotification();
    await doScanning();
  };

  const onToggleTorch = () => {
    const toggleStatus = toggleTorch();
    console.log('%c⧭', 'color: #e57373', toggleStatus);
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
