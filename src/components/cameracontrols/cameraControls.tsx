import { CameraButton, ScannerButton } from '@components';
import { ExtendedMediaTrackSupportedConstraints } from '@types';
import styles from './styles.less';

interface CameraControlsProps {
  onScanning: () => void;
  onToggleTorch: () => void;
  capabilities: ExtendedMediaTrackSupportedConstraints;
}

const CameraControls = (props: CameraControlsProps): JSX.Element => {
  const stub = () => {
    console.info('stub');
  };

  return (
    <section className={styles.cameraControlsWrapper}>
      <div className={styles.cameraControls} role="toolbar">
        <CameraButton
          name="flash_off"
          onClick={props.onToggleTorch}
          label="torch"
          supported={props.capabilities.torch}
        />

        <ScannerButton onClick={props.onScanning} />

        {/** For flipping to selfie mode. This may not be necessary. */}
        {/* <CameraButton name="camera" onClick={stub} label="flip" /> */}
      </div>
    </section>
  );
};

export { CameraControls };
