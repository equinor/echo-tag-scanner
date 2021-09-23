/**
 *   const Shutter = () => {
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

    const uploadMedia = () => {
    if (Array.isArray(state.mediaCaptures) && state.mediaCaptures.length > 0) {
      turnCameraOff(); // stops using user's webcam
      handleFile(state.mediaCaptures); // function from parent component
    }
  };
 */
