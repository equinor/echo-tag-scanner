import React, { useState } from 'react';
import styled from 'styled-components';
import { TagSummaryDto } from '@equinor/echo-search';
import { CaptureAndTorch, SearchResults, ZoomSlider } from '@components';
import { useEchoIsSyncing, useMountScanner, useSetActiveTagNo } from '@hooks';
import { NotificationHandler, useTagScanStatus } from '@services';
import {
  getTorchToggleProvider,
  getNotificationDispatcher as dispatchNotification,
  logger
} from '@utils';
import { SystemInfoTrigger } from './viewfinder/SystemInfoTrigger';

interface ScannerProps {
  stream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  scanArea: HTMLElement;
}

function Scanner({ stream, viewfinder, canvas, scanArea }: ScannerProps) {
  const [validatedTags, setValidatedTags] = useState<
    TagSummaryDto[] | undefined
  >(undefined);
  const { tagScanner, setZoomInputRef } = useMountScanner(
    viewfinder,
    canvas,
    stream
  );
  const tagSearch = useSetActiveTagNo();
  const { tagScanStatus, changeTagScanStatus } = useTagScanStatus();
  const echoIsSyncing = useEchoIsSyncing();

  // Accepts a list of validated tags and sets them in memory for presentation.
  function presentValidatedTags(tags: TagSummaryDto[]) {
    if (Array.isArray(tags) && tags.length > 0) {
      // We got more than 1 validated tag. Set them into state and rerender to present search results.
      setValidatedTags(tags);
    } else {
      // We got no validated tags.
      handleNoTagsFound();
      changeTagScanStatus('noTagsFound', true);
    }
  }

  function handleNoTagsFound() {
    tagScanner?.resumeViewfinder();
    setValidatedTags([]);
  }

  const onScanning = async () => {
    // Prevent scanning if Echo is syncing, otherwise the validation will not work.
    if (echoIsSyncing) {
      dispatchNotification({
        message: 'Scanning is available as soon as the tag syncing is done.',
        autohideDuration: 2000
      })();
      return;
    }

    // Initial preperations
    setValidatedTags(undefined);
    changeTagScanStatus('scanning', true);

    // Capture image.
    let scans = await tagScanner?.scan(scanArea.getBoundingClientRect());

    if (scans) {
      // Run OCR and validation to get possible tag numbers.
      const validatedTags = await tagScanner?.ocr(scans);

      // Put the validated tags in state.
      changeTagScanStatus('scanning', false);

      if (Array.isArray(validatedTags) && validatedTags?.length === 0) {
        dispatchNotification({
          message: 'No tags detected.',
          autohideDuration: 2000
        })();
      } else {
        if (validatedTags) {
          // Put the validated tags in state.
          presentValidatedTags(validatedTags);
        }
      }
    }
  };

  return (
    <>
      <ControlPad id="control-pad">
        {tagScanner && (
          <>
            <SystemInfoTrigger
              onDelayedTrigger={tagScanner.clipboardThis.bind(tagScanner)}
            />
            {tagScanner.capabilities?.zoom && (
              <ZoomSlider
                onSlide={tagScanner.alterZoom}
                zoomInputRef={setZoomInputRef}
                zoomOptions={tagScanner.capabilities?.zoom}
              />
            )}

            <CaptureAndTorch
              onToggleTorch={getTorchToggleProvider(tagScanner)}
              onScanning={onScanning}
              isDisabled={false /* Use this for when Echo fails to sync tags */}
              echoIsSyncing={echoIsSyncing}
              isScanning={tagScanStatus.scanning}
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
              tagScanner
                ?.prepareNewScan()
                .then(() => setValidatedTags(undefined));
            }}
          />
        )}
      </DialogueWrapper>
    </>
  );
}

const ControlPad = styled.section`
  position: absolute;
  bottom: 20px;
  display: grid;
  align-items: center;
  width: 100%;
  z-index: 4;

  // Move the control pad to the right;
  @media screen and (orientation: landscape) {
    display: flex;
    right: 56px;
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
