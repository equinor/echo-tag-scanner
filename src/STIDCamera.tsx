/*eslint no-eq-null: "off"*/
import { FC, useRef, useEffect } from 'react';
import styles from './styles.less';
import CapturePreviewer from './capturePreviewer/CapturePreviewer';
import useCameraState from './useCameraState';
import { createEDSButton } from './touchIcon/TouchIcon';
import { Stopwatch } from './stopwatch/Stopwatch';
import { useDeviceType } from '@hooks';
import { Button, Icon } from '@equinor/eds-core-react';

type STIDCamera = {
  closeCamera: () => void;
  handleFile?: any;
};

const STIDCamera: FC<STIDCamera> = ({ closeCamera, handleFile }) => {
  const video = useRef<HTMLVideoElement>(null);
  const selectEl = useRef<HTMLSelectElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const zoomInput = useRef<HTMLInputElement>(null);
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
  } = useCameraState(video, canvas, zoomInput, selectEl, closeCamera);
  const deviceType = useDeviceType();

  useEffect(() => {
    if (!state.showCarousel && video?.current) {
      video.current.srcObject = state.mediaStream;
    }
  }, [state.mediaStream, state.showCarousel]);

  const uploadMedia = () => {
    if (Array.isArray(state.mediaCaptures) && state.mediaCaptures.length > 0) {
      turnCameraOff(); // stops using user's webcam
      handleFile(state.mediaCaptures); // function from parent component
    }
  };

  const MediaCaptureMethodToggler = () => {
    return (
      <div className={styles.toggleCamera}>
        <input ref={zoomInput} type="range" className={styles.zoom} />
        <ul ref={indicator} className={styles.modeOptions}>
          <li
            className={state.cameraMode === 'video' ? styles.moveRight : styles.moveLeft}
            onClick={toggleCameraMode}
          >
            Video
          </li>
          <li
            className={state.cameraMode === 'video' ? styles.moveRight : styles.moveLeft}
            onClick={toggleCameraMode}
          >
            Photo
          </li>
        </ul>
      </div>
    );
  };

  const ImagePreviewer = () => {
    return (
      <>
        <div className={styles.carouselIcon} onClick={() => toggleCarousel()}>
          {createEDSButton('library_image', stub)}
          <span
            className={
              state.mediaCaptures.length === 0
                ? `${styles.counter} ${styles.hideCounter}`
                : styles.counter
            }
          >
            {state.mediaCaptures.length}
          </span>
        </div>
      </>
    );
  };

  const stub = () => {
    console.info('stub callback');
  };
  const Shutter = () => {
    const performAction = (action: string) => {
      return state.cameraMode === 'video' ? videoActions(action) : photoAction();
    };

    const shutter = () => {
      if (state.cameraMode === 'photo') {
        return createEDSButton('camera', stub);
      } else if (state.cameraMode === 'video') {
        if (state.recordingStatus) {
          return createEDSButton('stop', stub);
        } else {
          return createEDSButton('record', stub);
        }
      }
    };

    return (
      <>
        <div
          onClick={() => (state.recordingStatus ? performAction('stop') : performAction('take'))}
          className={styles.shutter}
        >
          {shutter()}
        </div>
      </>
    );
  };
  const cameraComponent = () => {
    return (
      <div className={styles.cameraWrapper}>
        <div className={styles.innerVideo}>
          {/* {state.cameraMode === 'video' && state.recordingStatus && (
            <Stopwatch className={styles.recordingCounter} />
          )} */}
          <video ref={video} className={styles.viewfinder} autoPlay />
        </div>
        <canvas className={styles.canvas} ref={canvas} />
        <div role="group" className={styles.cameraControlsWrapper}>
          <div className={styles.cameraControls}>
            {createEDSButton('lightbulb', stub)}
            <Shutter />
            <ImagePreviewer />
          </div>
        </div>
      </div>
    );
  };
  return cameraComponent();
  // <>
  //  const desktopDimensionOverrides = deviceType === 'desktop' ? getCameraDimensions() : undefined;
  //   {!state.showCarousel ? (
  //   ) : (
  //     <CapturePreviewer
  //       toggleCamera={toggleCarousel}
  //       mediaPreviews={state.mediaPreviews}
  //       actions={{
  //         deleteMedia: deleteMedia,
  //         upload: uploadMedia,
  //         toggleCamera: toggleCarousel
  //       }}
  //       previewDimensions={desktopDimensionOverrides}
  //     />
  //   )}
  // </>
};

export { STIDCamera };
