import React, { RefObject } from 'react';
import styled from 'styled-components';

import { Dimensions, useScanningAreaDimensions } from './viewFinderUtils';

interface ScanningAreaProps {
  captureAreaRef: RefObject<HTMLElement>;
}

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {
  const dimensions = useScanningAreaDimensions();

  return <SvgContainer ref={props.captureAreaRef} dimensions={dimensions} />;
};

const SvgContainer = styled.section<{ dimensions: Dimensions }>`
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

export { ScanningArea };
