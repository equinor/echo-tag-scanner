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

  return (
    <section className={styles.cameraControlsWrapper}>
      <div className={styles.cameraControls} role="toolbar">
        <CameraButton
          name="lightbulb"
          onClick={() => setIsScanning(!isScanning)}
          label="torch"
          supported={props.capabilities.torch}
        />

        <ScannerButton onClick={props.onScanning} isActive={isScanning} />

        {/** For flipping to selfie mode. This may not be necessary. */}
        {/* <CameraButton name="camera" onClick={stub} label="flip" /> */}
      </div>
    </section>
  );
};

export { CameraControls };
