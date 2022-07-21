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
  private readonly _scanRetries = 5;
  private readonly _scanDuration = 2; //seconds 

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
      scannerConstruct.promptCameraUsage().then(function(mediastream) {
        console.log(this)
        // If approved, setup the camera, ie super.setup()
        scannerConstruct.setup(mediastream);
        // Resolve "this" so that it can be React ref'd
        resolve(scannerConstruct);
      });
    });
  }

  // Prepare for a new scan by resetting the camera.
  public async prepareNewScan() {
    await this.canvasHandler.clearCanvas();
    this.capture = undefined;
    this.resumeViewfinder();
  }


  /**
   * Runs a series of captures in a set interval and appends them to a list.
   * @param area A bounding box for which the capture is cropped from.
   * @returns {Blob[]} A list of blobs.
   */
  public async scan(area: DOMRect): Promise<Blob[]> {
    return new Promise((resolve) => {
      const scans: Blob[] = [];
      const interval = (this._scanRetries / this._scanDuration) * 100;
      const intervalId = setInterval(async() => {
        var capture = await this.capturePhoto(area);
        if (capture.size > 50000) capture = await this.scale(area);
        scans.push(capture)
        
        // Log some image stats and a blob preview in network tab.
        this.logImageStats(capture, 'The postprocessed photo.');
        if (scans.length === this._scanRetries) {
            clearInterval(intervalId);
            resolve(scans);
          }
        }, interval)
      })
    }
    
    /**
   * Runs OCR on a list of blobs until a result is obtained or it reaches the end of the list.
   */
     public async ocr(scans: Blob[]): Promise<ParsedComputerVisionResponse> {
      for (let i = 0; i < scans.length; i++) {
          var ocrResult = await ocrRead(scans[i]);
          if (ocrResult.length > 1) return ocrResult;
          else console.info("OCR returned no results");
        }
        
      return []
    }

  public async validateTags(possibleTagNumbers: ParsedComputerVisionResponse,
    ): Promise<TagSummaryDto[]> {
      if (Array.isArray(possibleTagNumbers) && possibleTagNumbers.length > 0) {
        const beforeValidation = new Date();
        const result = await runTagValidation(possibleTagNumbers);
        const afterValidation = new Date();
        console.info(
          `Tag validation took ${
            afterValidation.getMilliseconds() -
            beforeValidation.getMilliseconds()
          } milliseconds.`
        );
        return result;
      } else {
        return [];
      }
    }
}
