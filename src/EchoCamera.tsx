import React, { useState } from 'react';
import {
  CameraControls,
  ScanningIndicator,
  SearchResults,
  Viewfinder,
  ZoomSlider
} from '@components';
import { useMountCamera, useSetActiveTagNo } from '@hooks';
import { NotificationHandler, useTagScanStatus } from '@services';
import { PossibleFunctionalLocations } from '@types';
import { getTorchToggleProvider, runTagValidation } from '@utils';
import styled from 'styled-components';
import { OfflineSystem, Syncer, TagSummaryDto } from '@equinor/echo-search';
import { eventHub } from '@equinor/echo-base';

const EchoCamera = () => {
  const [validatedTags, setValidatedTags] = useState<
    TagSummaryDto[] | undefined
  >(undefined);
  const { camera, canvas, viewfinder, zoomInput } = useMountCamera();
  const tagSearch = useSetActiveTagNo();
  const { tagScanStatus, changeTagScanStatus } = useTagScanStatus();
  const [tagSyncIsDone, setTagSyncIsDone] = useState(false);

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
  eventHub.subscribe('isSyncing', (syncStatus: boolean) => {
    console.log('checking if syncing: ', syncStatus);
    if (syncStatus) setTagSyncIsDone(true);
    else setTagSyncIsDone(false);
  });

  function handleNoTagsFound() {
    camera.resumeViewfinder();
    setValidatedTags([]);
  }

  const onScanning = async () => {
    setValidatedTags(undefined);
    camera.isScanning = true;

    /**
     * Handles the parsing and filtering of functional locations that was returned from the API.
     */
    async function validateTags(fLocations?: PossibleFunctionalLocations) {
      console.log('%c⧭', 'color: #d90000', fLocations);
      // The tag scanner returned some results.
      if (Array.isArray(fLocations?.results) && fLocations.results.length > 0) {
        const afterSearchCallback = () => {
          camera.isScanning = false;
        };
        const beforeValidation = new Date();
        const result = await runTagValidation(fLocations, afterSearchCallback);
        const afterValidation = new Date();
        console.info(
          `Tag validation took ${
            afterValidation.getMilliseconds() -
            beforeValidation.getMilliseconds()
          } milliseconds.`
        );

        return result;
      } else {
        // The tag scanner returned 0 results.
        handleNoTagsFound();
      }
    }

    // We won't make the user wait more than 10 seconds for the scanning results.
    // TODO: Retire the scanning race.
    const scanTookTooLong: Promise<PossibleFunctionalLocations> = new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve({ results: [] });
        }, 1000000);
      }
    );

    // This promise puts the scanning in motion.
    const scanAction: Promise<PossibleFunctionalLocations | undefined> =
      new Promise((resolve) => {
        resolve(camera.scan(changeTagScanStatus));
      });

    // Start the scan race.
    Promise.race([scanAction, scanTookTooLong])

      // Validate the tag results from OCR
      .then((funcLocations) => {
        changeTagScanStatus('uploading', false);
        changeTagScanStatus('validating', true);
        const validatedTags = validateTags(funcLocations);
        changeTagScanStatus('validating', false);
        return validatedTags;
      })

      // Receive the validated tags and present them.
      .then((validatedTags) => presentValidatedTags(validatedTags));
  };

  if (camera) {
    return (
      <Main>
        <Viewfinder canvasRef={canvas} videoRef={viewfinder} />

        <Section>
          {camera?.capabilities?.zoom && (
            <ZoomSlider
              onSlide={camera.alterZoom}
              zoomInputRef={zoomInput}
              zoomOptions={camera.capabilities?.zoom}
            />
          )}

          <CameraControls
            onToggleTorch={getTorchToggleProvider(camera)}
            onScanning={onScanning}
            isDisabled={camera.isScanning && tagSyncIsDone}
            supportedFeatures={{ torch: camera?.capabilities?.torch }}
          />
        </Section>
        <NotificationHandler />
        <DialogueWrapper>
          {validatedTags && (
            <SearchResults
              tagSummary={validatedTags}
              onTagSearch={tagSearch}
              onClose={() => {
                camera.resumeViewfinder();
                setValidatedTags(undefined);
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
      </Main>
    );
  } else {
    return null;
  }
};

const Section = styled.section`
  position: fixed;
  bottom: 10px;
  display: grid;
  height: 20%;
  width: 100%;
  align-items: center;
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
