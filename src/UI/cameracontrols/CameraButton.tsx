import React, { useRef } from 'react';
import styled from 'styled-components';
import { Icon } from '@equinor/eds-core-react';

interface TorchButtonProps {
  name: string;
  onClick?: () => void;
}

/**
 * Returns a button for toggling the torch feature.
 */
const TorchButton = (props: TorchButtonProps): JSX.Element => {
  const torchButtonRef = useRef<HTMLButtonElement>(null);

  function handleTorchToggling() {
    if (typeof props?.onClick === 'function') {
      torchButtonRef.current?.setAttribute(
        'aria-pressed',
        torchButtonRef.current?.getAttribute('aria-pressed') === 'true'
          ? 'false'
          : 'true'
      );
      props.onClick();
    }
  }

  return (
    <StyledTorchButton
      ref={torchButtonRef}
      aria-pressed="false"
      id="torch-button"
      onClick={handleTorchToggling}
    >
      <Icon name={'lightbulb'} color="white" />
    </StyledTorchButton>
  );
};

interface CaptureButtonProps {
  isDisabled?: boolean;
  isScanning?: boolean;
  echoIsSyncing?: boolean;
  className?: string;
  onClick?: () => void;
  id?: string;
}

/**
 * Returns a custom camera tag scanning button.
 */
const ScannerButton = (props: CaptureButtonProps): JSX.Element => {
  if (props.isDisabled) {
    return <DisabledScannerButton id={props.id} />;
  } else if (props.isScanning) {
    return <ScannerButtonIsScanning id={props.id} />;
  } else if (props.echoIsSyncing) {
    return <EchoIsSyncingButton id={props.id} onClick={props.onClick} />;
  } else {
    return <StyledScannerButton id={props.id} onClick={props.onClick} />;
  }
};
const StyledScannerButton = styled.button`
  border-radius: 100%;
  border-style: solid;
  border-color: var(--black);
  border-width: 3px;
  width: 75px;
  height: 75px;
  background-color: var(--white);
  grid-area: camerabutton;
`;

const EchoIsSyncingButton = styled(StyledScannerButton)`
  background-color: var(--warningIcon);
`;

const DisabledScannerButton = styled(StyledScannerButton)`
  background-color: var(--equiGreen1);
  box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
  -webkit-box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
  -moz-box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
`;

const ScannerButtonIsScanning = styled(StyledScannerButton)`
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  transform: scale(1);
  animation: pulse 2s infinite;
  background-color: var(--equiGreen1);

  @keyframes pulse {
    0% {
      transform: scale(0.7);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
    }

    70% {
      transform: scale(1);
      box-shadow: 0 0 0 20px rgba(0, 0, 0, 0);
    }

    100% {
      transform: scale(0.7);
      box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    }
  }
`;

const StyledTorchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--equiGreen1);
  border-radius: 100%;
  width: 55px;
  height: 55px;
  grid-area: torch;
  border: 1px solid;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  &[aria-pressed='true'] {
    background: var(--hoverIcon);
  }

  &:active {
    background-color: var(--equiBlue1);
  }

  &:disabled {
    background-color: var(--disabledColor);
  }

  .icon {
    width: 60%;
    height: 60%;
  }
`;

export { TorchButton, ScannerButton };
