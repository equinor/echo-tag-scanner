import { CameraButton, Shutter } from '@components';
import styles from './styles.less';

const CameraControls = (): JSX.Element => {
  const stub = () => {
    console.info('stub');
  };

  return (
    <div role="group" className={styles.cameraControlsWrapper}>
      <div className={styles.cameraControls}>
        <CameraButton name="flash_off" onClick={stub} />
        <Shutter />
        <CameraButton name="camera" onClick={stub} />
      </div>
    </div>
  );
};

export { CameraControls };
