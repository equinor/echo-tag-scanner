import { CameraButton, ScannerButton } from '@components';
import { useState } from 'react';
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
  // Temp scanning toggle until APIs are in place.
  const [isScanning, setIsScanning] = useState(false);

  function onScanning() {
    setIsScanning(!isScanning);
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

        <ScannerButton onClick={onScanning} isActive={isScanning} />

        {/** For flipping to selfie mode. This may not be necessary. */}
        {/* <CameraButton name="camera" onClick={stub} label="flip" /> */}
      </div>
    </section>
  );
};

export { CameraControls };
