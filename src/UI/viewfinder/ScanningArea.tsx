import React, { SetStateAction } from 'react';
import styled from 'styled-components';
import { zIndexes } from '@const';

interface ScanningAreaProps {
  scanningAreaRef: React.Dispatch<SetStateAction<HTMLElement | undefined>>;
}

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {

  return (
    <>
      <SvgContainer
        id="scanning-area"
        ref={(el: HTMLElement) => props.scanningAreaRef(el)}
      />
    </>
  );
};

const SvgContainer = styled.section`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //-------//

  width: var(--scanning-area-width-portrait);
  height: var(--scanning-area-height-portrait);
  border: 3px dotted var(--outOfService);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  z-index: ${zIndexes.scanningArea};

  @media screen and (orientation: landscape) {
    width: var(--scanning-area-width-landscape);
    height: var(--scanning-area-height-landscape);
  }
`;

export { ScanningArea };
