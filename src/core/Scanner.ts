import { ocrRead, TagScanningStages } from '@services';
import { ParsedComputerVisionResponse } from '@types';
import { Camera } from './Camera';
import { CameraProps } from './CoreCamera';

/**
 * This object implements tag scanning logic.
 */
export class TagScanner extends Camera {
  protected _isScanning = false;

  private constructor(props: CameraProps) {
    super(props);
  }

  /**
   * Asynchronously constructs the tag scanner.
   */
  static construct(props: CameraProps): Promise<TagScanner> {
    return new Promise((resolve) => {
      // Call the constructor above.
      const scannerConstruct = new TagScanner(props);

      // User is asked for permission to use the camera. (the async part)
      scannerConstruct.promptCameraUsage().then((mediastream) => {
        // If approved, setup the camera, ie super.setup()
        scannerConstruct.setup.call(scannerConstruct, mediastream);
        // Resolve "this" so that it can be React ref'd
        resolve(scannerConstruct);
      });
    });
  }

  public set isScanning(value: boolean) {
    this._isScanning = value;
  }

  public get isScanning() {
    return this._isScanning;
  }

  // Prepare for a new scan by resetting the camera.
  public async prepareNewScan() {
    await this.canvasHandler.clearCanvas();
    this.capture = undefined;
    this.resumeViewfinder();
  }

  public async scan(
    area: DOMRect,
    callback: (property: TagScanningStages, value: boolean) => void
  ): Promise<ParsedComputerVisionResponse | undefined> {
    this.pauseViewfinder();
    let capture = await this.capturePhoto(area);
    if (capture) {
      this.logImageStats(this.capture, 'The cropped photo.');

      if (capture.size > 50000) capture = await this.grayscale();
      if (capture.size > 50000) capture = await this.scale(area);
      this.capture = capture;

      callback('uploading', true);
      const result = await ocrRead(this.capture);

      this.isScanning = false;
      callback('uploading', false);
      return result;
    } else {
      this.isScanning = false;
      return undefined;
    }
  }
}
