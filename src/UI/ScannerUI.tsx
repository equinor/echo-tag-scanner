import React from 'react';
import styled from 'styled-components';
import {
  CameraControlsRow,
  SearchResults,
  GestureArea,
  CapturePreview,
  NotificationHandler,
  DebugInfoOverlay
} from '@ui';
import {
  useEchoIsSyncing,
  useMountScanner,
  useSetActiveTagNo,
  useValidatedTags
} from '@hooks';
import {
  getTorchToggleProvider,
  isDevelopment,
  isLocalDevelopment,
  isQA
} from '@utils';
import { SystemInfoTrigger } from './viewfinder/SystemInfoTrigger';
import { zIndexes } from '@const';
import { Debugger } from '../cameraLogic/debugger';

interface ScannerProps {
  stream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  scanningArea: HTMLElement;
}

/**
 * This component harbors everything a user interacts with.
 */
function Scanner({ stream, viewfinder, canvas, scanningArea }: ScannerProps) {
  const { tagScanner } = useMountScanner(
    viewfinder,
    canvas,
    stream,
    scanningArea
  );
  const { validatedTags, onTagScan, tagScanStatus, resetValidatedTags } =
    useValidatedTags(tagScanner);
  const tagSearch = useSetActiveTagNo();
  const echoIsSyncing = useEchoIsSyncing();

  return (
    <>
      <ControlPad id="control-pad" role="toolbar">
        {tagScanner && (
          <>
            {tagScanner && (isLocalDevelopment || isDevelopment || isQA) && (
              <DebugInfoOverlay
                tagScanner={tagScanner}
                viewfinder={viewfinder}
              />
            )}

            <CameraControlsRow
              onToggleTorch={getTorchToggleProvider(tagScanner)}
              onScanning={onTagScan}
              isDisabled={false /* Use this for when Echo fails to sync tags */}
              echoIsSyncing={echoIsSyncing}
              isScanning={tagScanStatus?.scanning}
              supportedFeatures={{
                torch: Boolean(tagScanner?.capabilities?.torch)
              }}
              onDebug={() => Debugger.debugAll(true, tagScanner)}
            />
          </>
        )}
      </ControlPad>
      {tagScanner && (
        <SystemInfoTrigger
          getContentsForClipboard={() => Debugger.clipboardThis(tagScanner)}
        />
      )}
      <NotificationHandler />
      <DialogueWrapper id="dialogues">
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
      {tagScanner && (isLocalDevelopment || isDevelopment) && (
        <CapturePreview camera={tagScanner} />
      )}
    </>
  );
}

const ControlPad = styled.section`
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
