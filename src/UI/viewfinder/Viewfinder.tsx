import React, { SetStateAction, Dispatch } from 'react';
import styled from 'styled-components';
import { isLocalDevelopment, isDevelopment, isQA } from '@utils';
import { ViewfinderDimensions } from '@types';
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

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  return (
    <>
      <Backdrop />
      {(isQA || isLocalDevelopment || isDevelopment) && <VersionNumber />}
      <Canvas
        ref={(el: HTMLCanvasElement) => props.setCanvasRef(el)}
        width={1280}
        height={720}
      />
      <CameraFeed
        playsInline // needed for the viewfinder to work in Safari
        ref={(el: HTMLVideoElement) => props.setVideoRef(el)}
        autoPlay
        disablePictureInPicture
        controls={false}
        width={props.dimensions.width}
        height={props.dimensions.height}
      />

      <ScanningArea scanningAreaRef={props.setScanningAreaRef} />
    </>
  );
};

const CameraFeed = styled.video`
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
  z-index: ${zIndexes.canvas};
`;

export { Viewfinder };
