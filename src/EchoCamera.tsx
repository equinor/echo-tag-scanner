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
import { MadOCRFunctionalLocations, ExtractedFunctionalLocation } from '@types';
import {
  getNotificationDispatcher as dispatchNotification,
  getTorchToggleProvider,
  tagSearch as runTagSearch
} from '@utils';
import styled from 'styled-components';

const EchoCamera = () => {
  const [scannedFunctionalLocations, setScans] = useState<
    ExtractedFunctionalLocation[] | undefined
  >(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const { camera, canvas, viewfinder, zoomInput } = useMountCamera();
  const tagSearch = useSetActiveTagNo();

  function handleValidatedTags(tags: ExtractedFunctionalLocation[]) {
    if (Array.isArray(tags) && tags.length > 0) {
      // We got more than 1 validated tag.
      // Set them into state and rerender to present search results.
      setScans(tags);
    } else {
      // We got no validated tags.
      handleNoTagsFound();
    }
  }

  function handleNoTagsFound() {
    camera.resumeViewfinder();
    setIsScanning(false);
    dispatchNotification({
      message: 'We did not recognize any tag numbers. Try again?',
      autohideDuration: 5000
    })();
  }

  const onScanning = async () => {
    setIsScanning(true);
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
    async function handleDetectedLocations(
      fLocations?: MadOCRFunctionalLocations
    ) {
      // The tag scanner returned some results.
      if (Array.isArray(fLocations?.results) && fLocations.results.length > 0) {
        const afterSearchCallback = () => {
          setIsScanning(false);
        };
        const beforeScan = new Date();
        // Send the results over to tag validation.
        const result = await runTagSearch(fLocations, afterSearchCallback);
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
    const scanTookTooLong: Promise<MadOCRFunctionalLocations> = new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve({ results: [] });
        }, 10000);
      }
    );

    // This promise puts the scanning in motion.
    const scanAction: Promise<MadOCRFunctionalLocations | undefined> =
      new Promise((resolve) => {
        resolve(camera.scan());
      });

    // Start the scan race.
    Promise.race([scanAction, scanTookTooLong])
      // Validate the tag results from OCR
      .then((locations) => handleDetectedLocations(locations))

      // Receive the validated tags and put them into state.
      .then((validatedTags) => handleValidatedTags(validatedTags))
      .catch((reason) => console.error('Quietly failing: ', reason));
  };

  return (
    <Main>
      <Viewfinder canvasRef={canvas} videoRef={viewfinder} />

      {camera.capabilities?.zoom && (
        <ZoomSlider
          onSlide={camera.alterZoom}
          zoomInputRef={zoomInput}
          zoomOptions={camera.capabilities?.zoom}
        />
      )}

      <CameraControls
        onToggleTorch={getTorchToggleProvider(camera)}
        onScanning={onScanning}
        isScanning={isScanning}
        supportedFeatures={{ torch: camera.capabilities?.torch }}
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

        {isScanning && <ScanningIndicator />}
      </DialogueWrapper>
    </Main>
  );
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
