import React from "react";
import styled from "styled-components";
import { TorchButton, ScannerButton } from '@components';
import { SupportedCameraFeatures } from '@types';

interface CameraControlsProps {
  /* Scanning callback */
  onScanning: () => void;
  /* Torch callback. If undefined, the torch is not supported. */
  onToggleTorch?: () => void;

  isDisabled?: boolean;
  supportedFeatures: SupportedCameraFeatures;
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
    <CameraControlsWrapper>
      <CameraController role="toolbar">
        {props.supportedFeatures.torch && (
          <TorchButton name="lightbulb" onClick={props.onToggleTorch} />
        )}
        <ScannerButton onClick={onScanning} isDisabled={props.isDisabled} />
      </CameraController>
    </CameraControlsWrapper>
  );
};

const CameraControlsWrapper = styled.div`
  width: 100%;

  @media screen and (orientation: landscape) {
    height: 100%;
  }
`;

const CameraController = styled.div`
  display: grid;
  grid-template-columns: [torch]1fr [shutter]1fr [empty-cell]1fr;
  justify-items: center;
  align-items: center;
  width: 100%;
  label {
    margin-right: 1.5em;
  }

  @media screen and (orientation: landscape) {
    width: auto;
    height: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: [empty-cell]1fr [shutter]1fr [torch]1fr;
  }
`;

export { CameraControls };
