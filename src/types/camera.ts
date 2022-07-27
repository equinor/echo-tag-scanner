export interface CameraProps {
  mediaStream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  additionalCaptureOptions?: DisplayMediaStreamConstraints;
}

export type PostprocessorProps = Pick<CameraProps, 'canvas'>;
