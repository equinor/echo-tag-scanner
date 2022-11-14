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

/**
 * This component represents a viewfinder which we find on modern cameras.
 * Everything in this component should be read-only (or maybe view-only), no interaction like buttons or gestures are allowed.
 */
const Viewfinder = (props: ViewfinderProps): JSX.Element => {
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
        width={props.dimensions.width}
        height={props.dimensions.height}
      />

      <ScanningArea
        scanningAreaRef={props.setScanningAreaRef}
        setCanvasRef={props.setCanvasRef}
        dimensions={props.dimensions}
      />
    </>
  );
};

const CameraFeed = styled.video`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //-------//
  background-color: var(--black);
  transition: all 0.3s ease;
  z-index: ${zIndexes.viewfinder};
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
`;

export { Viewfinder };
