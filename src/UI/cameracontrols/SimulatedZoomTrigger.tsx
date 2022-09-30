import React, { useEffect, useState } from 'react';
import { CameraResolution, ZoomSteps } from '@types';
import { isCustomResolutionEvent } from '@utils';

type SimulatedZoomTriggerProps = {
  onSimulatedZoom: (newZoom: ZoomSteps) => CameraResolution | undefined;
};

/** This component returns a button that will control the simulated zoom for the supported devices. */
const SimulatedZoomTrigger = (
  props: SimulatedZoomTriggerProps
): JSX.Element => {
  const [currentSimulatedZoom, setCurrentSimulatedZoom] =
    useState<ZoomSteps>(1);

  /** Initially mounts an event listener on in the global context in
   * order to do local state changes for when the simulated zoom is altered in the camera logic. */
  useEffect(function setupSimulatedZoomStateChangeFromEvent() {
    globalThis.addEventListener(
      'simulatedZoomSuccess',
      handleSimulatedZoomEvent
    );
    return () =>
      globalThis.removeEventListener(
        'simulatedZoomSuccess',
        handleSimulatedZoomEvent
      );

    /** Handles the state change from the zoom event so that button label and zoom step is updated. */
    function handleSimulatedZoomEvent(simulatedZoomEvent: Event) {
      if (isCustomResolutionEvent(simulatedZoomEvent)) {
        if (typeof simulatedZoomEvent.detail.zoomLevel === 'number') {
          setCurrentSimulatedZoom(simulatedZoomEvent.detail.zoomLevel);
        }
      } else {
        console.warn(
          'Encountered a type of custom event which was not expected -> ',
          simulatedZoomEvent.type
        );
        console.info(
          'Simulated zoom may have been performed, but the zoom trigger label will be out of sync.'
        );
      }
    }
  }, []);

  async function advanceSimulatedZoom() {
    switch (currentSimulatedZoom) {
      case 1:
        setCurrentSimulatedZoom(2);
        props.onSimulatedZoom(2);
        break;
      case 2:
        setCurrentSimulatedZoom(3);
        props.onSimulatedZoom(3);
        break;
      case 3:
        setCurrentSimulatedZoom(1);
        props.onSimulatedZoom(1);
        break;
      default:
        return;
    }
  }

  // TODO: Style the zoom button.
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <button
        onClick={advanceSimulatedZoom}
        style={{
          backgroundColor: 'hotpink',
          width: '42px',
          height: '42px',
          borderRadius: '10px'
        }}
      >
        {currentSimulatedZoom}x
      </button>
    </div>
  );
};

export { SimulatedZoomTrigger };
