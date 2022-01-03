import React from "react";
import styled from "styled-components";
import { CameraButton, ScannerButton } from '@components';

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
    <CameraControlsWrapper>
      <CameraController role="toolbar">
        <CameraButton
          name="lightbulb"
          onClick={props.onToggleTorch}
          label="torch"
          supported={Boolean(props.onToggleTorch)}
        />

        <ScannerButton onClick={onScanning} />
      </CameraController>
    </CameraControlsWrapper>
  );
};

const CameraControlsWrapper = styled.section`
    position: fixed;
    bottom: 5%;
    width: 100%;
`

const CameraController = styled.div`
  display: grid;
    grid-template-columns: [availablecell]1fr [shutter]1fr [carousel]1fr;
    justify-items: center;
    align-items: center;
    width: 100%;

    label {
        margin-right: 1.5em;
    }

    select {
        text-overflow: ellipsis;
        max-width: 100%;
    }
`

export { CameraControls };
