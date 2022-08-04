import React from 'react';
import styled from 'styled-components';
import { TorchButton, ScannerButton } from '@components';
import { Button } from '@equinor/eds-core-react';

interface CameraControlsProps {
  /* Scanning callback */
  onScanning: () => void;
  /* Torch callback. If undefined, the torch is not supported. */
  onToggleTorch?: () => void;
  onDebug?: () => void;

  isDisabled?: boolean;
  isScanning?: boolean;
  supportedFeatures: Pick<MediaTrackCapabilities, 'torch'>;
}

/**
 * Creates the Camera Controls
 * @param {callback} - The scanning action
 * @param {callback} - The torch action. If undefined, the torch button is disabled.
 */
const CaptureAndTorch = (props: CameraControlsProps): JSX.Element => {
  return (
    <CaptureAndTorchWrapper>
      <CaptureAndTorchGrid role="toolbar">
        {props.supportedFeatures.torch && (
          <TorchButton name="lightbulb" onClick={props.onToggleTorch} />
        )}
        <ScannerButton
          onClick={props.onScanning}
          isDisabled={props.isDisabled}
          isScanning={props.isScanning}
        />
        <Button
          variant="ghost"
          style={{ gridArea: 'empty-cell', background: 'hotpink' }}
          onClick={props.onDebug}
        >
          <span>
            Developer <br />
            test
          </span>
        </Button>
      </CaptureAndTorchGrid>
    </CaptureAndTorchWrapper>
  );
};

const CaptureAndTorchWrapper = styled.div`
  width: 100%;

  @media screen and (orientation: landscape) {
    height: 100%;
  }
`;

const CaptureAndTorchGrid = styled.div`
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

export { CaptureAndTorch };
