function createCameraControls() {
  return (
    <div role="group" className={styles.cameraControlsWrapper}>
      <div className={styles.cameraControls}>
        {createEDSButton('lightbulb', stub)}
        <Shutter />
        <ImagePreviewer />
      </div>
    </div>
  );
}
