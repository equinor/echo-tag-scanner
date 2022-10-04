import React, { SetStateAction, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useScanningAreaDimensions } from './viewFinderUtils';
import { isLocalDevelopment, isCustomEvent, getOrientation } from '@utils';
import { CameraResolution, ViewfinderDimensions } from '@types';
import { staticResolution } from '@const';

interface ViewfinderProps {
  setCanvasRef: React.Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  setVideoRef: React.Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
  videoRef?: HTMLVideoElement;
  dimensions: ViewfinderDimensions;
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const scanningAreaDimensions = useScanningAreaDimensions();

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
  z-index: 10;
`;

export { Viewfinder };
