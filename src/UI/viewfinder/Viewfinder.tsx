import React, { SetStateAction, Dispatch, useEffect, useState } from 'react';
import styled from 'styled-components';
import { isLocalDevelopment, isDevelopment, isQA, isCustomEvent } from '@utils';
import { ViewfinderDimensions, ZoomSteps } from '@types';
import { zIndexes } from '@const';
import { ScanningArea } from './ScanningArea';
import { VersionNumber, Backdrop } from '@ui';

interface ViewfinderProps {
  setCanvasRef: Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  setVideoRef: Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
  setScanningAreaRef: Dispatch<SetStateAction<HTMLElement | undefined>>;
  videoRef?: HTMLVideoElement;
  dimensions: ViewfinderDimensions;
}

type ZoomBehavior = {
  /** Specifies the scale value.*/
  zoomFactor: ZoomSteps;

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
    globalThis.addEventListener('ets-simulated-zoom', (event) => {
      if (isCustomEvent(event)) {
        let offset = 50;
        //@ts-ignore
        if (event.detail.zoomFactor !== 1) offset /= event.detail.zoomFactor;
        setZoomBehaviour({
          //@ts-ignore
          zoomFactor: event.detail.zoomFactor,
          translateOffset: offset
        });
      }
    });
  }, []);

  return (
    <>
      <Backdrop />
      {(isQA || isLocalDevelopment || isDevelopment) && <VersionNumber />}
      <CameraFeed
        id="viewfinder"
        ref={(el: HTMLVideoElement) => props.setVideoRef(el)}
        playsInline // needed for the viewfinder to work in Safari
        autoPlay
        disablePictureInPicture
        controls={false}
        zoomFactor={zoomBehaviour.zoomFactor}
        translateOffset={zoomBehaviour.translateOffset}
      />

      <SafeAreaCover id="safe-area-cover" />

      <ScanningArea
        scanningAreaRef={props.setScanningAreaRef}
        setCanvasRef={props.setCanvasRef}
        dimensions={props.dimensions}
      />
    </>
  );
};

// This element covers over the real estate beneath the echo-bars because we cannot resize the video element itself.
const SafeAreaCover = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: env(safe-area-inset-bottom, 0);
  z-index ${zIndexes.overlays};
  
  @media screen and (orientation: landscape) {
    bottom: unset;
    left: 0;
    height: 100%;
    width: env(safe-area-inset-left, 0);
  }
`;

const CameraFeed = styled.video<{
  zoomFactor: number;
  translateOffset: number;
}>`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;

  background-color: var(--black);
  transition: all 0.3s ease;
  z-index: ${zIndexes.viewfinder};
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  //--Zoom behavior--//
  transform: translate(
    -${(props) => String(props.translateOffset)}%,
    -${(props) => String(props.translateOffset)}%
  );
  scale: ${(props) => String(props.zoomFactor)};
`;

export { Viewfinder };
