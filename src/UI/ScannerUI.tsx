import React from 'react';
import styled from 'styled-components';
import { CaptureAndTorch, SearchResults, GestureArea } from '@ui';
import {
  useEchoIsSyncing,
  useMountScanner,
  useSetActiveTagNo,
  useValidatedTags
} from '@hooks';
import { NotificationHandler } from '@services';
import { getTorchToggleProvider } from '@utils';
import { SystemInfoTrigger } from './viewfinder/SystemInfoTrigger';
import { zIndexes } from '@const';

interface ScannerProps {
  stream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

function Scanner({ stream, viewfinder, canvas }: ScannerProps) {
  const { tagScanner, setZoomInputRef } = useMountScanner(
    viewfinder,
    canvas,
    stream
  );
  const { validatedTags, onTagScan, tagScanStatus, resetValidatedTags } =
    useValidatedTags(tagScanner);
  const tagSearch = useSetActiveTagNo();
  const echoIsSyncing = useEchoIsSyncing();

  return (
    <>
      <ControlPad>
        {tagScanner && (
          <>
            <SystemInfoTrigger
              onDelayedTrigger={tagScanner.clipboardThis.bind(tagScanner)}
            />
            <CaptureAndTorch
              onToggleTorch={getTorchToggleProvider(tagScanner)}
              onScanning={onTagScan}
              isDisabled={false /* Use this for when Echo fails to sync tags */}
              echoIsSyncing={echoIsSyncing}
              isScanning={tagScanStatus?.scanning}
              supportedFeatures={{
                torch: Boolean(tagScanner?.capabilities?.torch)
              }}
              onDebug={tagScanner.debugAll.bind(tagScanner, true)}
            />
          </>
        )}
      </ControlPad>
      <NotificationHandler />
      <DialogueWrapper>
        {validatedTags && (
          <SearchResults
            tagSummary={validatedTags}
            onTagSearch={tagSearch}
            onClose={() => {
              tagScanner?.prepareNewScan().then(resetValidatedTags);
            }}
          />
        )}
      </DialogueWrapper>
      {tagScanner && <GestureArea tagScanner={tagScanner} />}
    </>
  );
}

const ControlPad = styled.section`
  display: grid;
  align-items: center;
  position: fixed;

  // The offset should be so that the users thumb is naturally resting when the device is being held.
  bottom: 66px;

  height: var(--control-pad-height);
  width: 100%;
  z-index: ${zIndexes.cameraControls};

  // Move the control pad to the right;
  @media screen and (orientation: landscape) {
    display: flex;
    right: 20px;
    top: 0;
    bottom: unset;
    height: 100%;
    width: var(--control-pad-width-landscape);
  }
`;

const DialogueWrapper = styled.section`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
`;
export { Scanner };
