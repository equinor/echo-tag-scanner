import React, { SetStateAction } from 'react';
import styled from 'styled-components';
import { ViewfinderDimensions } from '@types';
import { useScanningAreaDimensions } from './viewFinderUtils';
import { zIndexes } from '@const';

interface ScanningAreaProps {
  scanningAreaRef: React.Dispatch<SetStateAction<HTMLElement | undefined>>;
}

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {
  const dimensions = useScanningAreaDimensions();

  return (
    <>
      <SvgContainer
        id="scanning-area"
        ref={(el: HTMLElement) => props.scanningAreaRef(el)}
        dimensions={dimensions}
      />
    </>
  );
};

const SvgContainer = styled.section<{ dimensions: ViewfinderDimensions }>`
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
  z-index: ${zIndexes.scanningArea};
`;

export { ScanningArea };
