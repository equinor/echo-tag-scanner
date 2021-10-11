import React, { useState } from 'react';
import styles from './styles.less';
import { Image, VideoPlayer, TouchIcon } from '@components';

export type CapturePreviewerItem = {
  objectUrl: string;
  revoke: (objectUrl: string) => void;
  type: 'video' | 'image';
};

type Actions = {
  deleteMedia: (deleteIndex: number) => void;
  upload: () => void;
  toggleCamera: () => void;
};

type CapturePreviewerProps = {
  mediaPreviews: CapturePreviewerItem[];
  actions?: Actions; // todo type functions
  toggleCamera: () => void;
  previewDimensions?: { width?: number; height?: number };
};

type CapturePreviewerState = {
  activeIndex: number;
};

const CapturePreviewer: React.FC<CapturePreviewerProps> = ({
  mediaPreviews,
  actions,
  toggleCamera,
  previewDimensions
}) => {
  const initialState: CapturePreviewerState = {
    activeIndex: 0
  };
  const [state, setState] = useState(initialState);

  function createSlideshowCounter() {
    if (mediaPreviews.length > 0) {
      return (
        <span className={styles.slideshowCounter}>
          {state.activeIndex + 1} of {mediaPreviews.length}
        </span>
      );
    }
  }

  function createSlideshowArrows() {
    return (
      <fieldset className={styles.slideshowArrowsWrapper}>
        <div role="group" className={styles.slideshowArrows}>
          <div className={styles.arrowContainerBackwards}>
            <TouchIcon
              icon="slideshowBackwards"
              size="25px"
              color="#fff"
              display="inline-flex"
              className={styles.arrow}
              onClick={mediaPreviews.length !== 0 ? previousMedia : undefined}
            />
          </div>

          <div className={styles.arrowContainerForwards}>
            <TouchIcon
              icon="slideshowForwards"
              size="25px"
              color="#fff"
              display="inline-flex"
              className={styles.arrow}
              onClick={mediaPreviews.length !== 0 ? nextMedia : undefined}
            />
          </div>
        </div>
      </fieldset>
    );
  }

  function getNextOrPreviousMediaPreview() {
    if (state.activeIndex >= mediaPreviews.length) {
      setState({ activeIndex: state.activeIndex - 1 });
      return [
        mediaPreviews[state.activeIndex - 1].objectUrl,
        mediaPreviews[state.activeIndex - 1].type
      ];
    }
    return [mediaPreviews[state.activeIndex].objectUrl, mediaPreviews[state.activeIndex].type];
  }

  function preview() {
    if (mediaPreviews.length !== 0) {
      const [mediaPreview, type] = getNextOrPreviousMediaPreview();

      if (type === 'image' && mediaPreview) {
        return (
          <li>
            <Image
              src={mediaPreview}
              alt="Image could not be loaded"
              staticDimensions={previewDimensions}
            />
          </li>
        );
      } else if (mediaPreview) {
        return (
          <li>
            <VideoPlayer
              assetUrl={mediaPreview}
              options={{ controls: true, ...previewDimensions }}
            />
          </li>
        );
      }
    }

    return (
      <li>
        <Image
          src={'https://1080motion.com/wp-content/uploads/2018/06/NoImageFound.jpg.png'}
          alt="Image could not be loaded"
        />
      </li>
    );
  }

  function nextMedia() {
    if (state.activeIndex === mediaPreviews.length - 1) {
      setState({ activeIndex: 0 });
    } else {
      setState({ activeIndex: state.activeIndex + 1 });
    }
  }

  function previousMedia() {
    if (state.activeIndex === 0) {
      setState({ activeIndex: mediaPreviews.length - 1 });
    } else {
      setState({ activeIndex: state.activeIndex - 1 });
    }
  }

  function createControlPad() {
    // upload, slett, crop?, back to camera
    return (
      <div role="group" className={styles.controlpad}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gridArea: 'exit'
          }}
        >
          {mediaPreviews.length > 0 && (
            <>
              <TouchIcon
                icon="upload"
                size="25px"
                color="var(--color-primary)"
                display="inline-flex"
                onClick={() => actions?.upload()}
              ></TouchIcon>
              <span className={styles.counter}>{mediaPreviews.length}</span>
            </>
          )}
        </div>
        <div
          style={{
            gridArea: 'delete'
          }}
        >
          <TouchIcon
            icon="deleteForever"
            size="50px"
            color="var(--color-primary)"
            display="inline-flex"
            onClick={() => actions?.deleteMedia(state.activeIndex)}
          />
        </div>
        <div style={{ gridArea: 'camera' }}>
          <TouchIcon
            icon="camera"
            size="25px"
            color="var(--color-primary)"
            display="inline-flex"
            onClick={toggleCamera}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.previewWrapper}>
      {createSlideshowCounter()}
      {createSlideshowArrows()}
      <ul className={styles.slideshow}>{preview()}</ul>

      <fieldset className={styles.controlpadWrapper}>{createControlPad()}</fieldset>
    </div>
  );
};

export default CapturePreviewer;
