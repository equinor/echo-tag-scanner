import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';
import { zIndexes } from '@const';
import { ViewfinderDimensions } from '@types';
import { getOrientation } from '@utils';

interface ScanningAreaProps {
  scanningAreaRef: React.Dispatch<SetStateAction<HTMLElement | undefined>>;
  setCanvasRef: Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
}

const ScanningArea = (props: ScanningAreaProps): JSX.Element => {
  const [currentOrientation, setOrientation] = useState(getOrientation());
  const [saDimensions, setSADimensions] = useState<ViewfinderDimensions>({
    width: undefined,
    height: undefined
  });

  // TODO: Refine this
  useEffect(() => {
    globalThis.addEventListener('resize', () => {
      const newOrientation = getOrientation();

      if (newOrientation !== currentOrientation) {
        setOrientation(newOrientation);
        if (newOrientation === 'portrait') {
          setSADimensions({ width: 720, height: 1280 });
        } else {
          setSADimensions({ width: 1280, height: 720 });
        }
      }
    });
  }, []);

  return (
    <>
      <ScanningAreaContainer
        id="scanning-area"
        ref={(el: HTMLElement) => props.scanningAreaRef(el)}
      >
        <HorizontalNotch top={'-5px'} left={'0'} />
        <HorizontalNotch top={'-5px'} right={'0'} />
        <HorizontalNotch bottom={'-5px'} left={'0'} />
        <HorizontalNotch bottom={'-5px'} right={'0'} />
        <VerticalNotch top={'-5px'} left={'-5px'} />
        <VerticalNotch bottom={'-5px'} left={'-5px'} />
        <VerticalNotch top={'-5px'} right={'-5px'} />
        <VerticalNotch bottom={'-5px'} right={'-5px'} />

        <PostprocessingCanvas
          ref={(el: HTMLCanvasElement) => props.setCanvasRef(el)}
          width={saDimensions.width}
          height={saDimensions.height}
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

type NotchPositioning = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
};

const HorizontalNotch = styled.div<NotchPositioning>`
  position: absolute;
  top: ${(props) => (props.top ? props.top : 'initial')};
  right: ${(props) => (props.right ? props.right : 'initial')};
  bottom: ${(props) => (props.bottom ? props.bottom : 'initial')};
  left: ${(props) => (props.left ? props.left : 'initial')};
  width: 40px;
  height: 5px;
  background-color: white;

  @media screen and (orientation: landscape) {
    width: 20px;
    height: 5px;
  }
`;

const VerticalNotch = styled.div<NotchPositioning>`
  position: absolute;
  top: ${(props) => (props.top ? props.top : 'initial')};
  right: ${(props) => (props.right ? props.right : 'initial')};
  bottom: ${(props) => (props.bottom ? props.bottom : 'initial')};
  left: ${(props) => (props.left ? props.left : 'initial')};
  border-radius: 10%;
  width: 5px;
  height: 45px;
  background-color: white;

  @media screen and (orientation: landscape) {
    height: 20px;
    width: 5px;
  }
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
  /* border: 3px dotted var(--outOfService); */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  z-index: ${zIndexes.scanningArea};
  box-sizing: content-box;
  border-color: rgba(0, 0, 0, 0.48);
  border-style: solid;

  border-top-width: calc((100vh - var(--scanning-area-height-portrait)) / 2);
  border-bottom-width: calc(
    (100vh - var(--scanning-area-height-portrait)) / 2 -
      var(--echo-bottom-bar-height)
  );
  border-right-width: calc((100vw - var(--scanning-area-width-portrait)) / 2);
  border-left-width: calc((100vw - var(--scanning-area-width-portrait)) / 2);

  // Landscape
  @media screen and (orientation: landscape) {
    width: var(--scanning-area-width-landscape);
    height: var(--scanning-area-height-landscape);

    border-top-width: calc((100vh - var(--scanning-area-height-landscape)) / 2);
    border-bottom-width: calc(
      (100vh - var(--scanning-area-height-landscape)) / 2
    );
    border-right-width: calc(
      (100vw - var(--scanning-area-width-landscape)) / 2
    );
    border-left-width: calc(
      (100vw - var(--scanning-area-width-landscape)) / 2 -
        var(--echo-sidebar-width)
    );
  }
`;

export { ScanningArea };
