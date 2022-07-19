import React, { RefObject, useRef, useState } from 'react';
import {
  CaptureAndTorch,
  ScanningArea,
  ScanningIndicator,
  SearchResults,
  Viewfinder,
  ZoomSlider
} from '@components';
import { useMountScanner, useSetActiveTagNo } from '@hooks';
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
import styled from 'styled-components';
import { TagSummaryDto } from '@equinor/echo-search';
import { eventHub } from '@equinor/echo-base';
import { EchoEnv } from '@equinor/echo-core';

const EchoCamera = () => {
  // Represets the camera viewfinder.
  const viewfinder = useRef<HTMLVideoElement>(null);
  // Used for postprocessing of captures.
  const canvas = useRef<HTMLCanvasElement>(null);
  // All tags within this bounding box will be scanned.
  const scanArea = useRef<HTMLElement>(null);


  return (
    <Main>
      <Viewfinder canvasRef={canvas} videoRef={viewfinder} />
      <ScanningArea captureAreaRef={scanArea} />

      {viewfinder.current && canvas.current && scanArea.current && (
        <Scanner viewfinder={viewfinder} canvas={canvas} scanArea={scanArea} />
      )}
    </Main>
  );
};

interface ScannerProps {
  viewfinder: RefObject<HTMLVideoElement>;
  canvas: RefObject<HTMLCanvasElement>;
  scanArea: RefObject<HTMLElement>;
}
function Scanner({ viewfinder, canvas, scanArea }: ScannerProps) {
  const [validatedTags, setValidatedTags] = useState<
    TagSummaryDto[] | undefined
  >(undefined);
  const { tagScanner, zoomInput } = useMountScanner(
    viewfinder,
    canvas,
    scanArea
  );
  const tagSearch = useSetActiveTagNo();
  const { tagScanStatus, changeTagScanStatus } = useTagScanStatus();

  // Controls the availability of scanning.
  const [tagSyncIsDone, setTagSyncIsDone] = useState(false);
  
  // When Echo is done syncing, we can rerender and open for scanning.
  // We currently have no good way of setting the initial mounted value.
  // There will be a small lag until EventHub is able to set the proper initial value.
  eventHub.subscribe('isSyncing', (syncStatus: boolean) => {
    console.log('Echo is syncing: ', syncStatus);
    if (syncStatus) setTagSyncIsDone(true);
    else setTagSyncIsDone(false);
  });
  console.log('Echo is syncing', tagSyncIsDone);

  tagScanner?.reportCameraFeatures();

  // Since we do not have tag syncing in development, this will mimick an interval where Echopedia is syncing.
  if (EchoEnv.isDevelopment) {
    const syncDelayMs = 2000;
    setTimeout(() => {
      setTagSyncIsDone(true);
    }, syncDelayMs);
  }

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

    changeTagScanStatus('uploading', true);
    tagScanner.isScanning = true;

    // Capture image.
    await tagScanner.scan(
      scanArea.current.getBoundingClientRect(),
      
    );

    // Run OCR to get possible tag numbers.
    const possibleTagNumbers = await tagScanner.ocr(changeTagScanStatus);
    tagScanner.isScanning = false;

    // Validate the possible tags with Echo-Search.
    const validatedTags = await tagScanner.validateTags(possibleTagNumbers, handleNoTagsFound);

    // Put the validated tags in state.
    presentValidatedTags(validatedTags);
  };

  return (
    <>
      <ControlPad>
        {tagScanner && (
          <>
            {tagScanner.capabilities?.zoom && (
              <ZoomSlider
                onSlide={tagScanner.alterZoom}
                zoomInputRef={zoomInput}
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

const Main = styled.main`
  .cameraWrapper {
    height: 100%;
  }
`;

const DialogueWrapper = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  // The height of this wrapper is based on the bottom offset
  // of the zoom slider and camera controls (20% and 5% respectively).
  height: calc(100% - 20%);
  width: 100%;
`;

export { EchoCamera };
