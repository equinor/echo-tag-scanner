import React, { SetStateAction, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useScanningAreaDimensions } from './viewFinderUtils';
import {
  isLocalDevelopment,
  isCustomEvent,
  getOrientation,
  isDevelopment
} from '@utils';
import { CameraResolution, ViewfinderDimensions } from '@types';
import { staticResolution, zIndexes } from '@const';

interface ViewfinderProps {
  setCanvasRef: React.Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  setVideoRef: React.Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
  videoRef?: HTMLVideoElement;
  dimensions: ViewfinderDimensions;
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const scanningAreaDimensions = useScanningAreaDimensions();

  const [dimensionsEvent, setDimensionsEvent] = useState<ViewfinderDimensions>({
    width: undefined,
    height: undefined
  });

  /**
   * Mounts an event handler to the global context that changes the dimensions of the viewfinder
   * as simulated zoom operations happen.
   */
  useEffect(function mountViewfinderDimensionChangeEventHandler() {
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

  return (
    <>
      <ViewFinder
        playsInline // needed for the viewfinder to work in Safari
        ref={(el: HTMLVideoElement) => props.setVideoRef(el)}
        autoPlay
        disablePictureInPicture
        controls={false}
        width={props.dimensions.width}
        height={props.dimensions.height}
      />

      <Canvas
        ref={(el: HTMLCanvasElement) => props.setCanvasRef(el)}
        width={scanningAreaDimensions.width}
        height={scanningAreaDimensions.height}
      />
    </>
  );
};

const ViewFinder = styled.video`
  background-color: var(--black);
  transition: all 0.3s ease;
  object-fit: cover;

  z-index: ${zIndexes.viewfinder};
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
`;

const Canvas = styled.canvas`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //-------//
  opacity: ${isLocalDevelopment || isDevelopment ? 1 : 0};
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  z-index: ${zIndexes.belowViewfinder};
`;

export { Viewfinder };
