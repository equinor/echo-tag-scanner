import { useState } from 'react';
import { debounce, getOrientation } from '@utils';
import EchoUtils from '@equinor/echo-utils';
import { Dimensions } from '@types';

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
    return {
      width: globalThis.innerWidth * 0.8,
      height: globalThis.innerHeight * (1 / 3)
    };
  } else {
    return {
      width: globalThis.innerWidth * 0.7,
      height: globalThis.innerHeight * (1 / 3)
    };
  }
}
