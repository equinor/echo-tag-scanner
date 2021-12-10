import { FC, useRef, useState, useEffect } from 'react';
import styles from './styles.less';
import { Camera, CameraProps } from './core/Camera';
import { CameraControls, Viewfinder, ZoomSlider, SearchResults } from '@components';
import { NotificationHandler } from '@services';
import { getNotificationDispatcher, extractFunctionalLocation } from '@utils';
import { ExtractedFunctionalLocation, MadOCRFunctionalLocations } from './types';
import { useSetActiveTagNo } from '@hooks';

const EchoCamera: FC = () => {
  const [functionalLocations, setFunctionalLocations] = useState<
    ExtractedFunctionalLocation[] | undefined
  >(undefined);
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

  const onScanning = async () => {
    if (cameraRef?.current != null) {
      const madOcrFunctionalLocations = await cameraRef.current.scan();
      if (madOcrFunctionalLocations && Array.isArray(madOcrFunctionalLocations?.results)) {
        const locations = filterFalsePositives(madOcrFunctionalLocations);
        if (locations.length > 1) {
          setFunctionalLocations(locations);
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore This var has already been checked and filtered above.
          tagSearch(locations[0].tagNumber);
        }
      } else {
        getNotificationDispatcher('We did not recognize any tag numbers.')();
      }
    }

    function filterFalsePositives(locations: MadOCRFunctionalLocations) {
      return locations.results
        .map((location) => extractFunctionalLocation(location))
        .filter((location) => location.sapPlantId && location.tagNumber);
    }
  };

  function provideTorchToggling() {
    const onToggleTorch = () => {
      if (cameraRef?.current != null) {
        cameraRef.current.toggleTorch();
      }
    };

    const onToggleUnsupportedTorch = () => {
      getNotificationDispatcher('The torch is not supported on this device.');
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
      <main className={styles.cameraWrapper}>
        <Viewfinder canvasRef={canvasRef} videoRef={videoRef} />

        <ZoomSlider
          onSlide={cameraRef.current?.alterZoom}
          zoomInputRef={zoomInputRef}
          zoomOptions={cameraRef?.current?.capabilities?.zoom}
        />

        <CameraControls onToggleTorch={provideTorchToggling()} onScanning={onScanning} />
        <NotificationHandler />
        {functionalLocations && functionalLocations.length > 1 && (
          <SearchResults
            functionalLocations={functionalLocations}
            onTagSearch={tagSearch}
            onClose={() => setFunctionalLocations(undefined)}
          />
        )}
      </main>
    );
  } else {
    return null;
  }
};

export { EchoCamera };
