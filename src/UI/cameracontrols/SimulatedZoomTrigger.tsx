import React, { useState } from 'react';
import { ZoomSteps } from '@types';

type SimulatedZoomTriggerProps = {
  onSimulatedZoom: (newZoom: ZoomSteps) => Promise<boolean>;
};

/** This component returns a button that will control the simulated zoom for the supported devices. */
const SimulatedZoomTrigger = (
  props: SimulatedZoomTriggerProps
): JSX.Element => {
  const [label, setLabel] = useState<ZoomSteps>(1);

  /** Performs the callback in order to alter the simulated zoom
   * If the simulated zoom is successful, the button label can be altered.
   */
  async function advanceZoom() {
    /**
     * TODO: There is a possibility that the max zoom level can be calculated JIT.
     * If the callback returns some clue or we catch the overcontrain error here, we can reset the zoom back to 1x.
     */
    switch (label) {
      case 1:
        var hasBeenZoomed = await props.onSimulatedZoom(2);
        if (hasBeenZoomed) setLabel(2);
        break;
      case 2:
        var hasBeenZoomed = await props.onSimulatedZoom(3);
        if (hasBeenZoomed) setLabel(3);
        break;
      case 3:
        var hasBeenZoomed = await props.onSimulatedZoom(1);
        if (hasBeenZoomed) setLabel(1);
        break;
      default:
        break;
    }
  }

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <button
        onClick={advanceZoom}
        style={{
          backgroundColor: 'hotpink',
          width: '24px',
          height: '24px',
          borderRadius: '10px'
        }}
      >
        {label}x
      </button>
    </div>
  );
};

export { SimulatedZoomTrigger };
