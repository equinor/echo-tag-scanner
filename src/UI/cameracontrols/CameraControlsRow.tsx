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
const CameraControlsRow = (props: CameraControlsProps): JSX.Element => {
  return (
    <RowGrid role="toolbar">
      {props.supportedFeatures.torch && (
        <TorchButton name="lightbulb" onClick={props.onToggleTorch} />
      )}
      <ScannerButton
        id="capture-button"
        onClick={props.onScanning}
        isDisabled={props.isDisabled}
        isScanning={props.isScanning}
        echoIsSyncing={props.echoIsSyncing}
      />
      {isDevelopment && (
        <DebugButton
          id="developer-button"
          variant="ghost"
          onClick={props.onDebug}
        >
          <Icon data={info_circle} color="white" />
        </DebugButton>
      )}
    </RowGrid>
  );
};

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

const RowGrid = styled.div`
  display: grid;
  grid-template-columns: [torch]1fr [camerabutton]1fr [debug]1fr;
  justify-items: center;
  align-items: center;
  width: 100%;
  height: 100%;

  @media screen and (orientation: landscape) {
    grid-template-columns: 1fr;
    grid-template-rows: [debug]1fr [camerabutton]1fr [torch]1fr;
    width: auto;
    height: 100%;
    padding-bottom: 16px;
  }
`;

export { CameraControlsRow };
