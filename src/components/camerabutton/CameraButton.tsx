import { Button, Icon } from '@equinor/eds-core-react';
import { themeConst } from '@equinor/echo-components';
import styles from './styles.less';

interface CameraButtonProps {
  name: string;
  onClick?: () => void;
}

/**
 * Returns an EDS ghost_icon button as a formatted camera button.
 * @param name An identifier from EDS system icons.
 * @param onClick callback.
 */
const CameraButton = (props: CameraButtonProps, ...rest: unknown[]): JSX.Element => (
  <button
    className={styles.iconButton}
    onClick={props.onClick}
    style={{ border: '1px solid' }}
    {...rest}
  >
    <Icon name={props.name ?? 'placeholder_icon'} color="white" className={styles.icon} />
  </button>
);

interface ShutterProps {
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Returns a custom camera shutter/tag scanning button.
 */
const ScannerButton = (props: ShutterProps): JSX.Element => (
  <button
    className={props.isActive ? styles.shutterScanning : styles.shutter}
    disabled={props.isDisabled}
    onClick={props.onClick}
  />
);

export { CameraButton, ScannerButton };
