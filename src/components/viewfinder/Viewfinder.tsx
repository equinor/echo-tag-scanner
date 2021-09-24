import styles from './styles.less';

interface ViewfinderProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasOptions?: unknown[];
  videoOptions?: unknown[];
}

const Viewfinder = (props: ViewfinderProps): JSX.Element => {
  return (
    <>
      <video ref={props.videoRef} className={styles.viewfinder} autoPlay {...props.videoOptions} />
      <canvas className={styles.canvas} ref={props.canvasRef} {...props.canvasOptions} />
    </>
  );
};

export { Viewfinder };
