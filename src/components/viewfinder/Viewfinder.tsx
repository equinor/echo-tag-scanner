import styles from './styles.less';
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
      <video
        playsInline // needed for the viewfinder to work in Safari
        ref={props.videoRef}
        className={styles.viewfinder}
        autoPlay
        {...props.videoOptions}
      />
      <canvas className={styles.canvas} ref={props.canvasRef} {...props.canvasOptions} />
    </>
  );
};

export { Viewfinder };
