import React from 'react';
import styled from "styled-components";
import { Icon } from '@equinor/eds-core-react';

interface TorchButtonProps {
  name: string;
  onClick?: () => void;
}


/**
 * Returns a button for toggling the torch feature.
 */
const TorchButton = (props: TorchButtonProps): JSX.Element => {
  return (
    <TorchTrigger onClick={props.onClick}>
      <Icon name={'lightbulb'} color="white" />;
    </TorchTrigger>
  );
};

interface CaptureButtonProps {
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Returns a custom camera tag scanning button.
 */
const ScannerButton = (props: CaptureButtonProps): JSX.Element => {
  if (props.isDisabled)
    return <ScannerTriggerInProgress onClick={props.onClick} />;
  else return <ScannerTrigger onClick={props.onClick} />;
};
const ScannerTrigger = styled.button`
  border-radius: 100%;
  border-style: solid;
  border-color: var(--black);
  border-width: 3px;
  width: 75px;
  height: 75px;
  background-color: var(--white);
  grid-area: shutter;
`;

const ScannerTriggerInProgress = styled(ScannerTrigger)`
  background-color: var(--equiGreen1);
  box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
  -webkit-box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
  -moz-box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
`;

const TorchTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--equiGreen1);
  border-radius: 100%;
  width: 55px;
  height: 55px;
  grid-area: torch;
  border: 1px solid;

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
