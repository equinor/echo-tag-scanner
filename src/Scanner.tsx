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

interface ScannerProps {
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  scanArea: HTMLElement;
}
function Scanner({ viewfinder, canvas, scanArea }: ScannerProps) {
  const [validatedTags, setValidatedTags] = useState<
    TagSummaryDto[] | undefined
  >(undefined);
  const { tagScanner, setZoomInputRef } = useMountScanner(viewfinder, canvas);
  const tagSearch = useSetActiveTagNo();
  const { tagScanStatus, changeTagScanStatus } = useTagScanStatus();

  // Run a complete debug on startup.
  logger.log('Info', () => {
    console.info('Starting camera');
    tagScanner.debugAll(false);
  });

  // Controls the availability of scanning.
  // We currently have no good way of setting the initial mounted value.
  // There will be a small lag until EventHub is able to set the proper initial value.
  const tagSyncIsDone = useEchoIsSyncing();

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
    tagScanner.resumeViewfinder();
    setValidatedTags([]);
  }

  const onScanning = async () => {
    // Prevent scanning if Echo is syncing, otherwise the validation will not work.
    if (!tagSyncIsDone) {
      dispatchNotification({
        message: 'Scanning is available as soon as the syncing is done.',
        autohideDuration: 2000
      })();
      return;
    }

    // Initial preperations
    setValidatedTags(undefined);
    changeTagScanStatus('scanning', true);

    const start = new Date();
    // Capture image.
    let scans = await tagScanner.scan(scanArea.getBoundingClientRect());
    // Run OCR and validation to get possible tag numbers.
    const validatedTags = await tagScanner.ocr(scans);
    const end = new Date();

    const seconds = (start.getTime() - end.getTime()) / 1000;
    const found = validatedTags.length;
    logger.doneScanning({ seconds, found });

    // Put the validated tags in state.
    changeTagScanStatus('scanning', false);

    if (validatedTags.length === 0) {
      dispatchNotification({
        message: 'No tags detected.',
        autohideDuration: 2000
      })();
    } else {
      // Put the validated tags in state.
      presentValidatedTags(validatedTags);
    }
  };

  return (
    <>
      <ControlPad>
        {tagScanner && (
          <>
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
              isDisabled={!tagSyncIsDone}
              isScanning={tagScanStatus.scanning}
              supportedFeatures={{ torch: tagScanner?.capabilities?.torch }}
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
                .prepareNewScan()
                .then(() => setValidatedTags(undefined));
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
