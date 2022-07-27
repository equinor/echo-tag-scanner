import { useState } from 'react';

import EchoUtils from '@equinor/echo-utils';

import { debounce } from '@utils';

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
  const viewMode = getViewMode();

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

  function getViewMode(): 'portrait' | 'landscape' {
    // We default to portrait if the height and width are equal.
    if (globalThis.innerHeight >= globalThis.innerWidth) return 'portrait';
    else return 'landscape';
  }
}
