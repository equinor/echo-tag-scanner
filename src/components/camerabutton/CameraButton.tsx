import React from 'react';
import styled from "styled-components";
import { Icon } from '@equinor/eds-core-react';

interface CameraButtonProps {
  name: string;
  onClick?: () => void;
  supported?: boolean;
  label?: string;
}

/**
 * Returns an EDS ghost_icon button as a formatted camera button.
 * @param name An identifier from EDS system icons.
 * @param onClick callback.
 */
const CameraButton = (props: CameraButtonProps): JSX.Element => {
  function createLabel() {
    if (props.supported) {
      return <Icon name={props.name ?? 'placeholder_icon'} color="white" />;
    } else {
      return <Icon name={props.name ?? 'placeholder_icon'} color="white" />;
    }
  }
  return (
    <CameraTrigger
      onClick={props.onClick}
      style={{ border: '1px solid' }}
      disabled={!props.supported}
    >
      {createLabel()}
    </CameraTrigger>
  );
};

interface ShutterProps {
  isDisabled?: boolean;
  className?: string;
  onClick?: () => void;
  isScanning?: boolean;
}

/**
 * Returns a custom camera shutter/tag scanning button.
 */
const ScannerButton = (props: ShutterProps): JSX.Element => (
  <ScannerTrigger disabled={props.isDisabled} onClick={props.onClick} />
);

const ScannerTrigger = styled.button`
  border-radius: 100%;
  border-style: solid;
  border-color: var(--black);
  border-width: 3px;
  width: 75px;
  height: 75px;
  background-color: var(--white);

  &:disabled {
    background-color: var(--equiGreen1);
    box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
    -webkit-box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
    -moz-box-shadow: -5px 4px 40px -6px rgba(0, 0, 0, 0.65) inset;
  }
`;

const CameraTrigger = styled.button`
display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--equiGreen1);
  border-radius: 100%;
  width: 55px;
  height: 55px;

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
`

export { CameraButton, ScannerButton };
