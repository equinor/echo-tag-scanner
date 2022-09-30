import React, { SetStateAction, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useScanningAreaDimensions } from './viewFinderUtils';
import { isLocalDevelopment, isCustomEvent, getOrientation } from '@utils';
import { CameraResolution, ViewfinderDimensions } from '@types';
import { staticResolution } from '@const';

interface ViewfinderProps {
  setCanvasRef: React.Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  setVideoRef: React.Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
  viewfinderDimensions: ViewfinderDimensions;
  videoRef?: HTMLVideoElement;
}

/* function setInitialResolution(): ViewfinderDimensions {
  const orientation = getOrientation();
  
  if (orientation === "portrait") return {width: staticResolution.}
} */

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const scanningAreaDimensions = useScanningAreaDimensions();

  const [viewfinderDimensions, setViewfinderDimensions] =
    useState<ViewfinderDimensions>({
      width: 720,
      height: 1280
    });

  /**
   * Mounts an event handler to the global context that changes the dimensions of the viewfinder
   * as simulated zoom operations happen.
   */
  /*   useEffect(function mountViewfinderDimensionChangeEventHandler() {
    globalThis.addEventListener(
      'simulatedZoomSuccess',
      handleSimulatedZoomEvent
    );
    return () =>
      globalThis.removeEventListener(
        'simulatedZoomSuccess',
        handleSimulatedZoomEvent
      );

    function handleSimulatedZoomEvent(newFeed: Event) {
      if (isCustomEvent<CameraResolution>(newFeed)) {
        setDimensionsEvent({
          width: newFeed.detail.width,
          height: newFeed.detail.height
        });
      }
    }
  }, []);
 */
  return (
    <>
      <ViewFinder
        playsInline // needed for the viewfinder to work in Safari
        ref={(el: HTMLVideoElement) => props.setVideoRef(el)}
        autoPlay
        disablePictureInPicture
        controls={false}
        width={globalThis.innerWidth}
        height={globalThis.innerHeight}
      />

      <Canvas
        ref={(el: HTMLCanvasElement) => props.setCanvasRef(el)}
        width={scanningAreaDimensions.width}
        height={scanningAreaDimensions.height}
        isLocalDevelopment={isLocalDevelopment}
      />
    </>
  );
};

const ViewFinder = styled.video`
  background-color: var(--black);
  transition: all 0.3s ease;
  object-fit: cover;
  height: 100%;
  width: 100%;
  z-index: 1;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
`;

const Canvas = styled.canvas<{ isLocalDevelopment: boolean }>`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //-------//
  opacity: ${(props) => (props.isLocalDevelopment ? 1 : 0)};
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  z-index: 10;
`;

export { Viewfinder };
