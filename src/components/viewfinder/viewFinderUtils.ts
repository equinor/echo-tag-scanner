import { useState } from 'react';
import { debounce, getOrientation } from '@utils';
import { CAPTUREAREA_DIMENSIONS } from '@const';
import EchoUtils from '@equinor/echo-utils';

export type Dimensions = {
  width: number;
  height: number;
};

export function useScanningAreaDimensions() {
  const [dimensions, setDimensions] = useState<Dimensions>(getDimensions());

  // Handles the resize of the scanning area whenever the viewport dimensions changes.
  EchoUtils.Hooks.useEffectAsync(async (signal) => {
    const handleResize = debounce(() => {
      if (signal.aborted) return;
      const dimensions = getDimensions();
      setDimensions(dimensions);
    });

    globalThis.addEventListener('resize', handleResize);

    return function cleanup() {
      globalThis.removeEventListener('resize', handleResize);
    };
  }, []);

  return dimensions;
}

function getDimensions(): Dimensions {
  const viewMode = getOrientation();

  if (viewMode === 'portrait') {
    return CAPTUREAREA_DIMENSIONS.portrait;
  } else {
    return CAPTUREAREA_DIMENSIONS.landscape;
  }
}
