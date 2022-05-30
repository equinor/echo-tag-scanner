import React, { useState } from 'react';
import {
  CameraControls,
  ScanningIndicator,
  SearchResults,
  Viewfinder,
  ZoomSlider
} from '@components';
import { useMountCamera, useSetActiveTagNo } from '@hooks';
import { NotificationHandler } from '@services';
import { PossibleFunctionalLocations, ExtractedFunctionalLocation } from '@types';
import {
  getNotificationDispatcher as dispatchNotification,
  getTorchToggleProvider,
  runTagValidation
} from '@utils';
import styled from 'styled-components';

const EchoCamera = () => {
  const [scannedFunctionalLocations, setScans] = useState<
  ExtractedFunctionalLocation[] | undefined
  >(undefined);
  const { camera, canvas, viewfinder, zoomInput } = useMountCamera();
  const tagSearch = useSetActiveTagNo();
  
  console.log('tags that has been detected: ', scannedFunctionalLocations?.length);

  // Accepts a list of validated tags and sets them in memory for presentation.
  function presentValidatedTags(tags: ExtractedFunctionalLocation[]) {
    if (Array.isArray(tags) && tags.length > 0) {
      // We got more than 1 validated tag. Set them into state and rerender to present search results.
      setScans(tags);
    } else {
      // We got no validated tags.
      handleNoTagsFound();
    }
  }

  function handleNoTagsFound() {
    camera.resumeViewfinder();
    dispatchNotification({
      message: 'We did not recognize any tag numbers. Try again?',
      autohideDuration: 5000
    })();
  }

  const onScanning = async () => {
    setScans(undefined);
    camera.isScanning = true;

    /** An IIFE that runs after 3 seconds.
     * If the tag scanning process is still in progress,
     * this will ensure the impatient user.
     */
    (function notifyUserLongScan() {
      setTimeout(() => {
        if (camera.isScanning) {
          dispatchNotification({
            message:
              'Hang tight, the scan appears to be taking longer than usual.',
            autohideDuration: 5000
          })();
        }
      }, 3000);
    })();

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
        const beforeScan = new Date();
        const result = await runTagValidation(fLocations, afterSearchCallback);
        const afterScan = new Date();
        console.info(
          `Tag validation took ${
            afterScan.getSeconds() - beforeScan.getSeconds()
          } seconds.`
        );

        return result;
      } else {
        // The tag scanner returned 0 results.
        handleNoTagsFound();
      }
    }

    // We won't make the user wait more than 10 seconds for the scanning results.
    const scanTookTooLong: Promise<PossibleFunctionalLocations> = new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve({ results: [] });
        }, 10000);
      }
    );

    // This promise puts the scanning in motion.
    const scanAction: Promise<PossibleFunctionalLocations | undefined> =
      new Promise((resolve) => {
        resolve(camera.scan());
      });

    // Start the scan race.
    Promise.race([scanAction, scanTookTooLong])

      // Validate the tag results from OCR
      .then((funcLocations) => validateTags(funcLocations))

      // Receive the validated tags and present them.
      .then((validatedTags) => presentValidatedTags(validatedTags));
  };

  if (camera) {
    return (
      <Main>
        <Viewfinder canvasRef={canvas} videoRef={viewfinder} />

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
          isScanning={camera.isScanning}
          supportedFeatures={{ torch: camera?.capabilities?.torch }}
        />
        <NotificationHandler />
        <DialogueWrapper>
          {scannedFunctionalLocations && scannedFunctionalLocations.length > 0 && (
            <SearchResults
              functionalLocations={scannedFunctionalLocations}
              onTagSearch={tagSearch}
              onClose={() => {
                camera.resumeViewfinder();
                setScans(undefined);
              }}
            />
          )}

          {camera.isScanning && <ScanningIndicator />}
        </DialogueWrapper>
      </Main>
    );
  } else {
    return null;
  }
};

const Main = styled.main`
  .cameraWrapper {
    height: 100%;
    // background-color: #00000010;
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
  height: calc(100% - 20% - 5%);
  width: 100%;
`;

export { EchoCamera };
