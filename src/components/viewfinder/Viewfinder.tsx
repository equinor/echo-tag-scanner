import React, {
  VideoHTMLAttributes,
  CanvasHTMLAttributes,
  SetStateAction
} from 'react';
import styled from 'styled-components';
import { useScanningAreaDimensions } from './viewFinderUtils';
import { isLocalDevelopment } from '@utils';
import { Backdrop } from './Backdrop';

interface ViewfinderProps {
  canvasRef: React.Dispatch<SetStateAction<HTMLCanvasElement | undefined>>;
  videoRef: React.Dispatch<SetStateAction<HTMLVideoElement | undefined>>;
  canvasOptions?: CanvasHTMLAttributes<HTMLCanvasElement>;
  videoOptions?: VideoHTMLAttributes<HTMLVideoElement>;
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const dimensions = useScanningAreaDimensions();

  return (
    <>
      <Backdrop />
      <ViewFinder
        playsInline // needed for the viewfinder to work in Safari
        ref={(el: HTMLVideoElement) => props.videoRef(el)}
        autoPlay
        disablePictureInPicture
        controls={false}
        width={globalThis.innerWidth}
        height={globalThis.innerHeight}
        {...props.videoOptions}
      />
      <Canvas
        ref={(el: HTMLCanvasElement) => props.canvasRef(el)}
        width={dimensions.width}
        height={dimensions.height}
        isLocalDevelopment={isLocalDevelopment}
        {...props.canvasOptions}
      />
    </>
  );
};

const ViewFinder = styled.video`
  position: relative;
  background-color: var(--black);
  transition: all 0.3s ease;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 3;
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
  z-index: 3;
`;

export { Viewfinder };
