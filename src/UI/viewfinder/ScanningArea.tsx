import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { zIndexes } from '@const';
import { ViewfinderDimensions } from '@types';
import { isDevelopment, isLocalDevelopment } from '@utils';

interface ScanningAreaProps {
  scanningAreaRef: React.Dispatch<SetStateAction<HTMLElement | undefined>>;
  setCanvasRef: Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  dimensions: ViewfinderDimensions;
}

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {
  return (
    <>
      <ScanningAreaContainer
        id="scanning-area"
        ref={(el: HTMLElement) => props.scanningAreaRef(el)}
      >
        <PostprocessingCanvas
          ref={(el: HTMLCanvasElement) => props.setCanvasRef(el)}
          width={props.dimensions.width}
          height={props.dimensions.height}
          id="drawing-area"
        />
      </ScanningAreaContainer>
    </>
  );
};

/** This is the main drawing canvas which will hold captures that are sent for OCR.
 * The purpose of this canvas is to temporarily store captures which will go through postprocessing steps.
 */
const PostprocessingCanvas = styled.canvas`
  opacity: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  z-index: ${zIndexes.canvas};
`;

const ScanningAreaContainer = styled.section`
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
