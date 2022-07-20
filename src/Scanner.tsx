import React, { RefObject, useState } from 'react';
import styled from 'styled-components';

import { TagSummaryDto } from '@equinor/echo-search';

import {
  CaptureAndTorch,
  ScanningIndicator,
  SearchResults,
  ZoomSlider
} from '@components';
import { useEchoIsSyncing, useMountScanner, useSetActiveTagNo } from '@hooks';
import {
  NotificationHandler,
  TagScanningStages,
  useTagScanStatus
} from '@services';
import { ParsedComputerVisionResponse } from '@types';
import {
  getTorchToggleProvider,
  runTagValidation,
  getNotificationDispatcher as dispatchNotification
} from '@utils';

interface ScannerProps {
  viewfinder: RefObject<HTMLVideoElement>;
  canvas: RefObject<HTMLCanvasElement>;
  scanArea: RefObject<HTMLElement>;
}
function Scanner({ viewfinder, canvas, scanArea }: ScannerProps) {
  const [validatedTags, setValidatedTags] = useState<
    TagSummaryDto[] | undefined
  >(undefined);
  const { tagScanner, setZoomInputRef } = useMountScanner(viewfinder, canvas);
  const tagSearch = useSetActiveTagNo();
  const { tagScanStatus, changeTagScanStatus } = useTagScanStatus();

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
    if (!tagSyncIsDone || tagScanner.isScanning) {
      dispatchNotification({
        message: 'Scanning is available as soon as the syncing is done.',
        autohideDuration: 2000
      })();
      return;
    }

    setValidatedTags(undefined);
    tagScanner.isScanning = true;

    /**
     * Handles the parsing and filtering of functional locations that was returned from the API.
     */
    async function validateTags(
      possibleTagNumbers: ParsedComputerVisionResponse,
      callback: (property: TagScanningStages, value: boolean) => void
    ) {
      if (Array.isArray(possibleTagNumbers) && possibleTagNumbers.length > 0) {
        callback('validating', true);
        const beforeValidation = new Date();
        const result = await runTagValidation(possibleTagNumbers);
        const afterValidation = new Date();
        console.info(
          `Tag validation took ${
            afterValidation.getMilliseconds() -
            beforeValidation.getMilliseconds()
          } milliseconds.`
        );
        callback('validating', false);

        return result;
      } else {
        // The tag scanner returned 0 results.
        callback('validating', false);
        handleNoTagsFound();
      }
    }

    // Get a list of possible tag matches.
    const possibleTags = await tagScanner.scan(
      scanArea.current.getBoundingClientRect(),
      changeTagScanStatus
    );

    // Validate the possible tags with Echo-Search.
    const validatedTags = await validateTags(possibleTags, changeTagScanStatus);
    tagScanner.isScanning = false;

    // Put the validated tags in state.
    presentValidatedTags(validatedTags);
  };

  return (
    <>
      <ControlPad id="controlarea">
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
              isDisabled={tagScanner.isScanning || !tagSyncIsDone}
              supportedFeatures={{ torch: tagScanner?.capabilities?.torch }}
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

        {tagScanStatus.uploading &&
          ScanningIndicator(
            <span>
              Uploading media. <br />
              <br /> This could take a while depending on your internet
              connection.
            </span>
          )}
        {tagScanStatus.validating && ScanningIndicator('Validating...')}
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
