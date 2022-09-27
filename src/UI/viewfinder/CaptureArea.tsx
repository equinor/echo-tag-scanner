import React, { SetStateAction } from 'react';
import styled from 'styled-components';
import { Dimensions } from '@types';
import { useScanningAreaDimensions } from './viewFinderUtils';

interface ScanningAreaProps {
  captureAreaRef: React.Dispatch<SetStateAction<HTMLElement | undefined>>;
}

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {
  const dimensions = useScanningAreaDimensions();

  return (
    <>
      <SvgContainer
        id="scan-area"
        ref={(el: HTMLElement) => props.captureAreaRef(el)}
        dimensions={dimensions}
      />
    </>
  );
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
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  z-index: 10;
`;

export { ScanningArea };
