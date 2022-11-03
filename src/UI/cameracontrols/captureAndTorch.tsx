import React from 'react';
import styled from 'styled-components';
import { TorchButton, ScannerButton } from '@ui';
import { Button, Icon } from '@equinor/eds-core-react';
import { isDevelopment } from '@utils';
import { info_circle } from '@equinor/eds-icons';

interface CameraControlsProps {
  /* Scanning callback */
  onScanning: () => void;
  /* Torch callback. If undefined, the torch is not supported. */
  onToggleTorch?: () => void;
  onDebug?: () => void;

  isDisabled?: boolean;
  isScanning?: boolean;
  echoIsSyncing?: boolean;
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
          echoIsSyncing={props.echoIsSyncing}
        />
        {isDevelopment && (
          <DebugButton variant="ghost" onClick={props.onDebug}>
            <Icon data={info_circle} color="white" />
          </DebugButton>
        )}
      </CaptureAndTorchGrid>
    </CaptureAndTorchWrapper>
  );
};

const CaptureAndTorchWrapper = styled.div`
  width: 100%;
  height: 100%;

  @media screen and (orientation: landscape) {
    height: 100%;
    padding-bottom: 16px;
  }
`;

const DebugButton = styled(Button)`
  grid-area: debug;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--equiGreen1);
  border-radius: 100%;
  width: 55px;
  height: 55px;
  border: 1px solid;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  &:active {
    background-color: var(--equiBlue1);
  }

  &:disabled {
    background-color: var(--disabledColor);
  }

  .icon {
    fill: white;
    width: 60%;
    height: 60%;
  }
`;

const CaptureAndTorchGrid = styled.div`
  display: grid;
  grid-template-columns: [torch]1fr [shutter]1fr [debug]1fr;
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
