import { TagSummaryDto } from '@equinor/echo-search';
import { ocrRead, TagScanningStages } from '@services';
import { ParsedComputerVisionResponse } from '@types';
import { runTagValidation } from '../utils';
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

  /**
   * Captures a frame and runs postprocessing.
   * @returns {Blob} The postprocessed frame.
   */
  public async scan(
    area: DOMRect,
  ): Promise<Blob | undefined> {
    this.pauseViewfinder();
    let capture = await this.capturePhoto(area);
    if (capture) {
      this.logImageStats(this.capture, 'The cropped photo.');

      if (capture.size > 50000) capture = await this.grayscale();
      if (capture.size > 50000) capture = await this.scale(area);
      this.capture = capture;

      return capture;
    } else {
      this.isScanning = false;
      return undefined;
    }
  }
  
  /**
   * Uses whatever capture is in memory and runs OCR on it.
   */
  public async ocr(callback: (property: TagScanningStages, value: boolean) => void) {
    if (this.capture) {
      callback('runningOcr', true);
      const result = await ocrRead(this.capture);
      callback("runningOcr", false);
      return result;
    }
  }

  public async validateTags(possibleTagNumbers: ParsedComputerVisionResponse,
    callback: (property: TagScanningStages, value: boolean) => void): Promise<TagSummaryDto[]> {
      this.isScanning = true;
      if (Array.isArray(possibleTagNumbers) && possibleTagNumbers.length > 0) {
        callback('validating', true);
        const beforeValidation = new Date();
        const result = await runTagValidation(possibleTagNumbers);
        const afterValidation = new Date();
        console.info(
          `Tag validation took ${
            afterValidation.getMilliseconds() -
            beforeValidation.getMilliseconds()
          } milliseconds.`
        );
        this.isScanning = false;
        callback('validating', false);
        return result;
      } else {
        this.isScanning = false;
        callback('validating', false);
        return [];
      }
    }
}
