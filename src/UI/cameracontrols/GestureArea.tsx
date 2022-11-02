import React, { PointerEvent, useState } from 'react';
import styled from 'styled-components';
import { zIndexes } from '@const';
import { ZoomGestureHandler, TagScanner } from '@cameraLogic';

interface TouchEvent extends PointerEvent<HTMLElement> {}
interface GestureAreaProps {
  tagScanner: TagScanner;
}

const GestureArea = (props: GestureAreaProps) => {
  const [zoomGestureHandler] = useState(
    new ZoomGestureHandler({ tagScanner: props.tagScanner })
  );

  function handleTouch(e: TouchEvent) {
    zoomGestureHandler.handleTouch.call(zoomGestureHandler, e);
  }

  return <GestureSection onPointerOut={handleTouch} id="gesture-area" />;
};

const GestureSection = styled.section`
  position: absolute;
  width: 100%;

  // Temporarily give some space at the top for the Echo-buttons.
  top: 10%;

  bottom: var(--control-pad-height);
  z-index: ${zIndexes.gestures};

  @media screen and (orientation: landscape) {
    left: 0;
    top: 15%;
    right: var(--control-pad-width-landscape);
    width: unset;
    height: 100%;
  }
`;

export { GestureArea };
