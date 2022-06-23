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
        {...props.videoOptions}
      />
      <Canvas ref={props.canvasRef} {...props.canvasOptions} />
      
    </>
  );
};

const ViewFinder = styled.video`
    background-color: var(--black);
    transition: all 0.3s ease;
    width: 100%;
    height: 100vh;
    object-fit: cover;
`

const Canvas = styled.canvas`
  height: 0;
`

export { Viewfinder };
