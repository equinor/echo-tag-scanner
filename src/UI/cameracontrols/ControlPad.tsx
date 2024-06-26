import React from 'react';
import { TagScanner } from '@cameraLogic';
import styled from 'styled-components';
import { zIndexes } from '@const';
import { Debugger } from '@cameraLogic';
import { getTorchToggleProvider } from '@utils';
import { CameraControlsRow, GestureArea, LabelAndClose } from '@ui';
import { TagScanStatus } from '@types';

interface ControlPadProps {
  tagScanner: TagScanner;
  viewfinder: HTMLVideoElement;
  echoIsSyncing: boolean;
  tagScanStatus: TagScanStatus;
  onTagScan: () => Awaited<Promise<void>>;
}

export const CameraControls = (props: ControlPadProps) => {
  return (
    <>
      <ControlPadWrapper id="control-pad" role="toolbar">
        <>
          <CameraControlsRow
            onToggleTorch={getTorchToggleProvider(props.tagScanner)}
            onScanning={props.onTagScan}
            isDisabled={false /* Use this for when Echo fails to sync tags */}
            echoIsSyncing={props.echoIsSyncing}
            isScanning={props.tagScanStatus?.scanning}
            supportedFeatures={{
              torch: Boolean(props.tagScanner?.capabilities?.torch)
            }}
            onDebug={() => Debugger.debugAll(true, props.tagScanner)}
          />
        </>
      </ControlPadWrapper>
      <GestureArea tagScanner={props.tagScanner} />
      <LabelAndClose />
    </>
  );
};

const ControlPadWrapper = styled.section`
  display: grid;
  align-items: center;
  position: absolute;

  // The offset should be so that the users thumb is naturally resting when the device is being held.
  bottom: var(--control-pad-bottom-offset);

  height: var(--control-pad-height);
  width: 100%;
  z-index: ${zIndexes.cameraControls};

  // Move the control pad to the right;
  @media screen and (orientation: landscape) {
    display: flex;
    right: var(--control-pad-right-offset);
    top: 0;
    bottom: unset;
    height: 100%;
    width: var(--control-pad-width-landscape);
  }
`;
