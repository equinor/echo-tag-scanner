import React from 'react';
import styled from "styled-components"
import { VideoHTMLAttributes, CanvasHTMLAttributes, RefObject } from 'react';

interface ViewfinderProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  videoRef: RefObject<HTMLVideoElement>;
  canvasOptions?: CanvasHTMLAttributes<HTMLCanvasElement>;
  videoOptions?: VideoHTMLAttributes<HTMLVideoElement>;
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
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
        // TODO: set dynamic dimensions
        width={'500'}
        height="300"
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
