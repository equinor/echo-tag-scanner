/*eslint no-eq-null: "off"*/
import { FC, useRef, useEffect, useState } from 'react';
import styles from './styles.less';
import { useCameraState } from './state/useCameraState';
import { CameraControls, Viewfinder, Toast, GestureHandler } from '@components';

type STIDCamera = {
  closeCamera: () => void;
  handleFile?: any;
};

const STIDCamera: FC<STIDCamera> = ({ closeCamera, handleFile }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const selectElRef = useRef<HTMLSelectElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const indicator = useRef<HTMLUListElement>(null);
  const {
    state,
    videoActions,
    photoAction,
    toggleCameraMode,
    toggleCarousel,
    turnCameraOff,
    deleteMedia,
    toggleTorch,
    getCameraDimensions
  } = useCameraState(videoRef, canvasRef, zoomInputRef, selectElRef, closeCamera);

  useEffect(() => {
    if (!state.showCarousel && videoRef?.current) {
      videoRef.current.srcObject = state.mediaStream;
    }
  }, [state.mediaStream, state.showCarousel]);

  const [noTagsDetectedToast, setNoTagsDetectedToast] = useState(false);
  const onScanning = () => {
    setNoTagsDetectedToast(!noTagsDetectedToast);
  };

  return (
    <main className={styles.cameraWrapper}>
      <Viewfinder canvasRef={canvasRef} videoRef={videoRef} />
      <GestureHandler />
      <CameraControls onToggleTorch={toggleTorch} onScanning={onScanning} />
      {noTagsDetectedToast && <Toast open message="Scanning" />}
    </main>
  );
};

export { STIDCamera };