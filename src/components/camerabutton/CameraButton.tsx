import { Button, Icon } from '@equinor/eds-core-react';
import { themeConst } from '@equinor/echo-components';

interface CameraButtonProps {
  name: string;
  onClick?: () => void;
}

/**
 * Returns an EDS ghost_icon button as a formatted camera button.
 * @param name An identifier from EDS system icons.
 * @param onClick callback.
 */
const CameraButton = (props: CameraButtonProps, ...rest: unknown[]): JSX.Element => {
  return (
    <Button variant="ghost_icon" onClick={props.onClick} style={{ border: '1px solid' }} {...rest}>
      <Icon name={props.name || 'placeholder_icon'} />
    </Button>
  );
};

interface ShutterProps {
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const Shutter = (props: ShutterProps): JSX.Element => {
  return (
    <button disabled={props.isDisabled} onClick={props.onClick}>
      <Icon color={themeConst.equiGreen1} name={'close'} />
    </button>
  );
};

export { CameraButton, Shutter };
