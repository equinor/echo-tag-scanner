import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styled from 'styled-components';

import { isCustomZoomEvent } from '@utils';
import { zIndexes } from '@const';
import { Backdrop } from '@ui';
import { ScanningArea } from './ScanningArea';

interface ViewfinderProps {
  setCanvasRef: Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  setVideoRef: Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
  setScanningAreaRef: Dispatch<SetStateAction<HTMLElement | undefined>>;
  videoRef?: HTMLVideoElement;
}

type ZoomBehavior = {
  /** Specifies the scale value.*/
  zoomFactor: number;

  /**
   * The offset adjustment for a scaled viewfinder.
   * If the viewfinder is scaled up, this offset will ensure it remains in the center of viewport.
   */
  translateOffset: number;
};

/**
 * This component represents a viewfinder which we find on modern cameras.
 * Everything in this component should be read-only (or maybe view-only), no interaction like buttons or gestures are allowed.
 */
const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const [zoomBehaviour, setZoomBehaviour] = useState<ZoomBehavior>({
    zoomFactor: 1,
    translateOffset: 50
  });

  useEffect(function mountSimulatedZoomEventListener() {
    globalThis.addEventListener('camera-zoom', (event) => {
      if (isCustomZoomEvent(event)) {
        let offset = 50;
        if (event.detail.zoomFactor !== 1) offset /= event.detail.zoomFactor;
        setZoomBehaviour({
          zoomFactor: event.detail.zoomFactor,
          translateOffset: offset
        });
      }
    });
  }, []);

  return (
    <>
      <Backdrop />
      <CameraFeed
        id="viewfinder"
        ref={(el: HTMLVideoElement) => props.setVideoRef(el)}
        playsInline // needed for the viewfinder to work in Safari
        autoPlay
        muted
        disablePictureInPicture
        controls={false}
        $zoomFactor={zoomBehaviour.zoomFactor}
        $translateOffset={zoomBehaviour.translateOffset}
      />

      <SafeAreaCover id="safe-area-cover" />

      <ScanningArea
        scanningAreaRef={props.setScanningAreaRef}
        setCanvasRef={props.setCanvasRef}
      />
    </>
  );
};

// This element covers over the real estate beneath the echo-bars because we cannot resize the video element itself.
// Unfortunately, there is at the present no way to prevent this element from inhabiting the DOM when its not needed.
const SafeAreaCover = styled.div`
  position: fixed;
  bottom: 0;
  width: 100vw;
  height: env(safe-area-inset-bottom, 0);
  z-index: ${zIndexes.overlays};
  background-color: white;

  @media screen and (orientation: landscape) {
    bottom: unset;
    left: 0;

    // The safe areas turns out to not be part of viewport.
    height: calc(100vh + env(safe-area-inset-bottom));

    // Apologies for the ugliness. The width of this will be minimum the width of the echo-bar.
    // It was not possible to declare a 0 width whenever the safe-area-cover element is not needed.
    width: calc(env(safe-area-inset-left, 0) + var(--echo-sidebar-width));
  }

  @media screen and (min-width: 928px) {
    width: 0;
  }
`;

const CameraFeed = styled.video<{
  $zoomFactor: number;
  $translateOffset: number;
}>`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;

  background-color: var(--black);
  transition: all 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  //--Zoom behavior--//
  transform: translate(
    -${(props) => String(props.$translateOffset)}%,
    -${(props) => String(props.$translateOffset)}%
  );
  scale: ${(props) => String(props.$zoomFactor)};
`;

export { Viewfinder };
