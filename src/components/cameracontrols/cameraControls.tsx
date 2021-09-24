import { CameraButton, ScannerButton } from '@components';
import styles from './styles.less';

interface CameraControlsProps {
  onScanning: () => void;
  onToggleTorch: () => void;
}

const CameraControls = (props: CameraControlsProps): JSX.Element => {
  const stub = () => {
    console.info('stub');
  };

  return (
    <section className={styles.cameraControlsWrapper}>
      <div className={styles.cameraControls} role="toolbar">
        <CameraButton name="flash_off" onClick={props.onToggleTorch} />
        <ScannerButton onClick={props.onScanning} />
        <CameraButton name="camera" onClick={stub} />
      </div>
    </section>
  );
};

export { CameraControls };
