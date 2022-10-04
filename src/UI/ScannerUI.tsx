import React from 'react';
import styled from 'styled-components';
import {
  CaptureAndTorch,
  SearchResults,
  ZoomSlider,
  SimulatedZoomTrigger,
  DebugInfoOverlay
} from '@ui';
import {
  useEchoIsSyncing,
  useMountScanner,
  useSetActiveTagNo,
  useValidatedTags
} from '@hooks';
import { NotificationHandler } from '@services';
import {
  getTorchToggleProvider,
  isDevelopment,
  isLocalDevelopment
} from '@utils';
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
      {tagScanner && (isLocalDevelopment || isDevelopment) && (
        <DebugInfoOverlay tagScanner={tagScanner} viewfinder={viewfinder} />
      )}
      <ControlPad>
        {tagScanner && (
          <>
            <SystemInfoTrigger
              onDelayedTrigger={tagScanner.clipboardThis.bind(tagScanner)}
            />
            {tagScanner.zoomMethod?.type === 'native' && (
              <ZoomSlider
                onSlide={tagScanner.alterZoom}
                zoomInputRef={setZoomInputRef}
                zoomOptions={tagScanner.capabilities?.zoom}
              />
            )}

            {tagScanner.zoomMethod?.type === 'simulated' &&
              isLocalDevelopment && (
                <SimulatedZoomTrigger
                  onSimulatedZoom={tagScanner.alterSimulatedZoom.bind(
                    tagScanner
                  )}
                />
              )}

            <CaptureAndTorch
              onToggleTorch={getTorchToggleProvider(tagScanner)}
              onScanning={onTagScan}
              isDisabled={false /* Use this for when Echo fails to sync tags */}
              echoIsSyncing={echoIsSyncing}
              isScanning={tagScanStatus?.scanning}
              supportedFeatures={{
                torch: Boolean(tagScanner?.capabilities?.torch)
              }}
              onDebug={tagScanner.debugAll.bind(tagScanner, false)}
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
    </>
  );
}

const ControlPad = styled.section`
  display: grid;
  align-items: center;
  position: fixed;
  bottom: 10px;
  height: 20%;
  width: 100%;
  z-index: ${zIndexes.cameraControls};

  // Move the control pad to the right;
  @media screen and (orientation: landscape) {
    display: flex;
    right: 20px;
    top: 0;
    bottom: unset;
    height: 100%;
    width: 20%;
  }
`;

const DialogueWrapper = styled.section`
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  // The height of this wrapper is based on the bottom offset
  // of the zoom slider and camera controls (20% and 5% respectively).
  height: 100%;
  width: 100%;
`;
export { Scanner };
