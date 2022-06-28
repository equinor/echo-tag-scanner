import React, { RefObject, useEffect, useState } from 'react';
import styled from 'styled-components';

interface ScanningAreaProps {
  captureAreaRef: RefObject<HTMLElement>;
}

type ScanningAreaDimensions = {
  width: number;
  height: number;
};

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {
  const [dimensions, setDimensions] = useState<ScanningAreaDimensions>(
    getDimensions()
  );

  // Handles the resize of the scanning area whenever the viewport dimensions changes.
  // TODO: Consider debounce and/or only run if the device is rotated.
  useEffect(() => {
    function handleResize() {
      setDimensions(getDimensions());
    }

    globalThis.addEventListener('resize', handleResize);

    return function cleanup() {
      globalThis.removeEventListener('resize', handleResize);
    };
  }, []);

  return <SvgContainer ref={props.captureAreaRef} dimensions={dimensions} />;
};

const SvgContainer = styled.section<{ dimensions: ScanningAreaDimensions }>`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //-------//

  width: ${(props) => props.dimensions.width}px;
  height: ${(props) => props.dimensions.height}px;
  border: 3px dotted var(--outOfService);
`;

function getDimensions() {
  const viewMode = getViewMode();

  if (viewMode === 'portrait') {
    return {
      width: globalThis.innerWidth * 0.8,
      height: globalThis.innerHeight * (1 / 3)
    };
  } else {
    return {
      width: globalThis.innerWidth * 0.6,
      height: globalThis.innerHeight * (1 / 3)
    };
  }

  function getViewMode(): 'portrait' | 'landscape' {
    // We default to portrait if the height and width are equal.
    if (globalThis.innerHeight >= globalThis.innerWidth) return 'portrait';
    else return 'landscape';
  }
}

export { ScanningArea };
