import React, { SetStateAction, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useScanningAreaDimensions } from './viewFinderUtils';
import { isLocalDevelopment, isCustomEvent } from '@utils';
import { CameraResolution, Dimensions } from '@types';

interface ViewfinderProps {
  canvasRef: React.Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  videoRef: React.Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const dimensions = useScanningAreaDimensions();

  const [dimensionsEvent, setDimensionsEvent] = useState<Dimensions>({
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
        ref={(el: HTMLVideoElement) => props.videoRef(el)}
        autoPlay
        disablePictureInPicture
        controls={false}
        width={dimensionsEvent.width ?? '100%'}
        height={dimensionsEvent.height ?? '100%'}
      />
      <Canvas
        ref={(el: HTMLCanvasElement) => props.canvasRef(el)}
        width={dimensions.width}
        height={dimensions.height}
        isLocalDevelopment={isLocalDevelopment}
      />
    </>
  );
};

const ViewFinder = styled.video`
  background-color: var(--black);
  transition: all 0.3s ease;
  object-fit: cover;

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
`;

export { Viewfinder };
