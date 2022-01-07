import React, { FC, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Camera, CameraProps } from './core/Camera';
import {
  CameraControls,
  Viewfinder,
  ZoomSlider,
  SearchResults,
  ScanningIndicator
} from '@components';
import { NotificationHandler } from '@services';
import {
  getNotificationDispatcher as dispatchNotification,
  filterFalsePositives
} from '@utils';

import { ExtractedFunctionalLocation, MadOCRFunctionalLocations } from '@types';
import { useSetActiveTagNo } from '@hooks';

const EchoCamera = () => {
  const [functionalLocations, setFunctionalLocations] = useState<
    ExtractedFunctionalLocation[] | undefined
  >(undefined);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<Camera>();
  const tagSearch = useSetActiveTagNo();

  // Instansiate the camera core class.
  useEffect(function mountCamera() {
    if (cameraRef.current == null) {
      const props: CameraProps = {
        viewfinder: videoRef,
        canvas: canvasRef
      };
      cameraRef.current = new Camera(props);
    }

    // Setup the zoom slider with the min, max and step values.
    if (zoomInputRef?.current != null) {
      zoomInputRef.current.min = assignZoomSettings('min');
      zoomInputRef.current.max = assignZoomSettings('max');
      zoomInputRef.current.step = assignZoomSettings('step');
      zoomInputRef.current.value = '1';
    }

    function cleanup() {
      if (cameraRef.current) {
        cameraRef.current.stopCamera();
      }
    }
    return cleanup;
  }, []);

  function assignZoomSettings(type: 'min' | 'max' | 'step' | 'value'): string {
    if (cameraRef?.current != null) {
      const camera = cameraRef.current;
      if (type === 'value') {
        if (camera.settings?.zoom) {
          return String(camera.settings.zoom);
        } else {
          return '1';
        }
      }
      if (camera.capabilities?.zoom) {
        if (camera.capabilities.zoom[type]) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return String(camera.zoom[type]);
        }
      }
    }
    // If zoom capabilities does not exist, we need to return a stringified zero
    // to prevent a stringified undefined to be assigned to the zoom slider.
    return '0';
  }

  const onScanning = () => {
    setIsScanning(true);
    setFunctionalLocations(undefined);

    /**
     * Handles the parsing and filtering of functional locations that was returned from the API.
     */
    function handleDetectedLocations(
      madOcrFunctionalLocations?: MadOCRFunctionalLocations
    ) {
      console.info('Got a location result:', madOcrFunctionalLocations);
      setIsScanning(false);
      if (
        madOcrFunctionalLocations &&
        Array.isArray(madOcrFunctionalLocations?.results) &&
        madOcrFunctionalLocations.results.length > 0
      ) {
        console.log('%c⧭', 'color: #f279ca', madOcrFunctionalLocations);
        filterFalsePositives(madOcrFunctionalLocations).then(
          handleValidatedTags
        );
      } else {
        // The tag scanner returned 0 results.
        handleNoTagsFound();
      }

      function handleValidatedTags(locations: ExtractedFunctionalLocation[]) {
        console.log('final validation results', locations);
        if (locations.length > 1) {
          // We got more than 1 validated tag.
          setFunctionalLocations(locations);
        } else if (locations.length === 1) {
          // We got 1 validated tag.
          tagSearch(locations[0].tagNumber);
          cameraRef.current.resumeViewfinder();
        } else {
          // We got no validated tags.
          handleNoTagsFound();
        }
      }

      function handleNoTagsFound() {
        cameraRef.current.resumeViewfinder();
        dispatchNotification({
          message: 'We did not recognize any tag numbers. Try again?',
          autohideDuration: 5000
        })();
      }
    }

    if (cameraRef?.current != null) {
      (function notifyUserLongScan() {
        setTimeout(() => {
          if (isScanning) {
            dispatchNotification(
              'Hang tight, the scan appears to be taking longer than usual.'
            )();
          }
        }, 3000);
      })();

      // We won't make the user wait more than 10 seconds for the scanning results.
      const scanTookTooLong: Promise<MadOCRFunctionalLocations> = new Promise(
        (resolve) => {
          console.info('starting scan timeout timer');
          setTimeout(() => {
            resolve({ results: [] });
          }, 10000);
        }
      );

      const scanAction: Promise<MadOCRFunctionalLocations | undefined> =
        new Promise((resolve) => {
          console.info('attempting to resolve tag number(s)');
          resolve(cameraRef?.current?.scan());
        });

      // Start the scan race.
      Promise.race([scanAction, scanTookTooLong])
        .then((locations) => handleDetectedLocations(locations))
        .catch((reason) => console.error('Quietly failing: ', reason));
    }
  };

  function provideTorchToggling() {
    const onToggleTorch = () => {
      if (cameraRef?.current != null) {
        cameraRef.current.toggleTorch();
      }
    };

    const onToggleUnsupportedTorch = () => {
      dispatchNotification('The torch is not supported on this device.')();
    };

    if (cameraRef?.current != null) {
      if (cameraRef?.current.capabilities?.zoom) {
        return onToggleTorch;
      } else {
        return onToggleUnsupportedTorch;
      }
    }
  }

  if (cameraRef?.current) {
    return (
      <Main>
        <Viewfinder canvasRef={canvasRef} videoRef={videoRef} />

        <ZoomSlider
          onSlide={cameraRef.current?.alterZoom}
          zoomInputRef={zoomInputRef}
          zoomOptions={cameraRef?.current?.capabilities?.zoom}
        />

        <CameraControls
          onToggleTorch={provideTorchToggling()}
          onScanning={onScanning}
        />
        <NotificationHandler />
        <DialogueWrapper>
          {functionalLocations && functionalLocations.length > 1 && (
            <SearchResults
              functionalLocations={functionalLocations}
              onTagSearch={tagSearch}
              onClose={() => {
                cameraRef.current.resumeViewfinder();
                setFunctionalLocations(undefined);
              }}
            />
          )}
          {isScanning && <ScanningIndicator />}
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
`

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
