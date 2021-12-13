import { CameraButton, ScannerButton } from '@components';
import styles from './styles.less';

interface CameraControlsProps {
  /* Scanning callback */
  onScanning: () => void;
  /* Torch callback. If undefined, the torch is not supported. */
  onToggleTorch?: () => void;
}

/**
 * Creates the Camera Controls
 * @param {callback} - The scanning action
 * @param {callback} - The torch action. If undefined, the torch button is disabled.
 */
const CameraControls = (props: CameraControlsProps): JSX.Element => {
  function onScanning() {
    props.onScanning();
  }

  return (
    <section className={styles.cameraControlsWrapper}>
      <div className={styles.cameraControls} role="toolbar">
        <CameraButton
          name="lightbulb"
          onClick={props.onToggleTorch}
          label="torch"
          supported={Boolean(props.onToggleTorch)}
        />

        <ScannerButton onClick={onScanning} />
      </div>
    </section>
  );
};

export { CameraControls };
