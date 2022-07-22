import React, {
  VideoHTMLAttributes,
  CanvasHTMLAttributes,
  RefObject
} from 'react';
import styled from 'styled-components';

import { useScanningAreaDimensions } from './viewFinderUtils';
interface ViewfinderProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  videoRef: RefObject<HTMLVideoElement>;
  canvasOptions?: CanvasHTMLAttributes<HTMLCanvasElement>;
  videoOptions?: VideoHTMLAttributes<HTMLVideoElement>;
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  const dimensions = useScanningAreaDimensions();

  return (
    <>
      <ViewFinder
        playsInline // needed for the viewfinder to work in Safari
        ref={props.videoRef}
        autoPlay
        disablePictureInPicture
        controls={false}
        width={globalThis.innerWidth}
        height={globalThis.innerHeight}
        {...props.videoOptions}
      />
      <Canvas
        ref={props.canvasRef}
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
`;

const Canvas = styled.canvas`
  width: 500px;
  height: 300px;
`;

export { Viewfinder };
