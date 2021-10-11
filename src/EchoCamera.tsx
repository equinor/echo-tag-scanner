import { FC, useRef, useEffect, useState } from 'react';
import styles from './styles.less';
import { useCameraState } from './state/useCameraState';
import { CameraControls, Viewfinder, Toast, ZoomSlider } from '@components';
import { ExtendedMediaTrackSupportedConstraints } from '@types';
import { useUserProfile } from '@equinor/echo-core';

async function getSubscription() {
  const formdata = new FormData();
  formdata.append('apiId', 'MadOcrApi');
  const init = {
    method: 'POST',
    body: JSON.stringify({ apiId: 'MadOcrApi' })
  };
  const response = await fetch('https://api.equinor.com/console/authentication/subscription', init);

  console.log(response);
}

const EchoCamera: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const { state, toggleTorch } = useCameraState(videoRef, canvasRef, zoomInputRef);
  const capabilities: ExtendedMediaTrackSupportedConstraints =
    navigator.mediaDevices.getSupportedConstraints();

  const profile = useUserProfile();
  console.log('profile', profile);

  useEffect(() => {
    if (!state.showCarousel && videoRef?.current) {
      videoRef.current.srcObject = state.mediaStream;
    }
  }, [state.mediaStream, state.showCarousel]);

  useEffect(() => {
    async function fetch2() {
      await getSubscription();
    }
    fetch2();
  }, []);

  const [noTagsDetectedToast, setNoTagsDetectedToast] = useState(false);
  const [torchNotSupportedToast, setTorchNotSupportedToast] = useState(false);
  const onScanning = () => {
    setNoTagsDetectedToast(!noTagsDetectedToast);
  };

  const onToggleTorch = () => {
    const toggleStatus = toggleTorch();
    console.log('%c⧭', 'color: #007300', toggleStatus);
    if (toggleStatus === false) {
      setTorchNotSupportedToast(true);
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
      {noTagsDetectedToast && (
        <Toast
          open
          message="Placeholder for scanning notification."
          onClose={() => setNoTagsDetectedToast(false)}
        />
      )}
      {torchNotSupportedToast && (
        <Toast
          open
          message="We were not able to turn on the lights."
          onClose={() => setTorchNotSupportedToast(false)}
        />
      )}
    </main>
  );
};

export { EchoCamera };
