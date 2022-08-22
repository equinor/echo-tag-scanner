import React, {
  VideoHTMLAttributes,
  CanvasHTMLAttributes,
  SetStateAction
} from 'react';
import styled from 'styled-components';
import { isLocalDevelopment } from '@utils';
import { useScanningAreaDimensions } from './viewFinderUtils';

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
        {...props.canvasOptions}
      />
    </>
  );
};

const ViewFinder = styled.video`
  background-color: var(--black);
  transition: all 0.3s ease;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  z-index: 1;
`;

const Canvas = styled.canvas`
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: {isLocalDevelopment ? 1 : -1}
  //-------//
`;

export { Viewfinder };
