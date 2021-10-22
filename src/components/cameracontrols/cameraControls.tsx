import { CameraButton, ScannerButton } from '@components';
import { ExtendedMediaTrackSupportedConstraints } from '@types';
import { useState } from 'react';
import styles from './styles.less';

interface CameraControlsProps {
  onScanning: () => void;
  onToggleTorch: () => void;
  capabilities: ExtendedMediaTrackSupportedConstraints;
}

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
          supported={props.capabilities.torch}
        />

        <ScannerButton onClick={onScanning} isActive={isScanning} />

        {/** For flipping to selfie mode. This may not be necessary. */}
        {/* <CameraButton name="camera" onClick={stub} label="flip" /> */}
      </div>
    </section>
  );
};

export { CameraControls };
