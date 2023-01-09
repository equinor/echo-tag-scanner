import { CameraProps, CroppingStats, Timers } from '@types';
import { isProduction, logScanningAttempt } from '@utils';
import { TagSummaryDto } from '@equinor/echo-search';
import { Camera } from './camera';
import { OCR } from './ocr';
import { Debugger } from './debugger';

/**
 * This object implements tag scanning logic.
 */
export class TagScanner extends Camera {
  private _scanRetries = 5;
  private _scanDuration = 2; //seconds
  private _OCR = new OCR({ tagScanner: this });
  private _scanningArea: HTMLElement;

  constructor(props: CameraProps) {
    super(props);
    this._scanningArea = props.scanningArea;
    globalThis.testPostOCR = this._OCR.testPostOCR.bind(this._OCR);
  }

  public get scanningArea(): HTMLElement {
    return this._scanningArea;
  }

  public async performCropping(): Promise<Blob> {
    // clientWidth and clientHeight is used to get the dimensions without the border.
    const scanningAreaWidth = this._scanningArea.clientWidth;
    const scanningAreaHeight = this._scanningArea.clientHeight;

    // Find the (x,y) position of the scanning area on the viewfinder.
    // TODO: Link to documentation
    let sx = this.viewfinder.videoWidth / 2 - scanningAreaWidth / 2;
    let sy = this.viewfinder.videoHeight / 2 - scanningAreaHeight / 2;
    let cropWidth = scanningAreaWidth;
    let cropHeight = scanningAreaHeight;

    // If zoom value is set to something more than 1 and is simulated, additional crop calculations are done.
    // TODO: Link to documentation
    if (this.zoomMethod.type === 'simulated' && this.zoom === 2) {
      sx += scanningAreaWidth / this.zoom / 2;
      sy += scanningAreaHeight / this.zoom / 2;
      cropWidth /= this.zoom;
      cropHeight /= this.zoom;
    } else if (this.zoom > 2) {
      throw new Error(
        `Encountered a zoom ${this.zoom} value which isn't supported.`
      );
    }

    const stats: CroppingStats = {
      sx,
      sy,
      cropWidth,
      cropHeight,
      zoom: this.zoom
    };

    return await this.crop({
      sx,
      sy,
      sWidth: cropWidth,
      sHeight: cropHeight
    });
  }

  // Prepare for a new scan by resetting the camera.
  public async prepareNewScan() {
    this.canvasHandler.clearCanvas();
    this.capture = undefined;
    this.resumeViewfinder();
  }

  /**
   * Runs a series of captures in a set interval and appends them to a list.
   * @returns {Blob[]} A list of blobs.
   */
  public async scan(): Promise<Blob[]> {
    return new Promise((finishScanning) => {
      let extractWidth = this._scanningArea.clientWidth;
      let extractHeight = this._scanningArea.clientHeight;

      if (this.zoomMethod.type === 'simulated') {
        extractWidth /= this.zoom;
        extractHeight /= this.zoom;
      }

      const scans: Blob[] = [];
      /** Determines the delay between captures in milliseconds. */
      const scanInterval = (this._scanRetries / this._scanDuration) * 100;
      const intervalId = setInterval(
        handleIntervalledCapture.bind(this),
        scanInterval
      );

      async function handleIntervalledCapture(this: TagScanner) {
        let capture = await this.capturePhoto();
        capture = await this.performCropping();
        capture = await this._canvasHandler.getCanvasContentAsBlob({
          sx: 0,
          sy: 0,
          sWidth: extractWidth,
          sHeight: extractHeight
        });
        scans.push(capture);

        if (scans.length === this._scanRetries) {
          // Scanning is finished.
          clearInterval(intervalId);

          // Log some image stats and a blob preview in network tab.
          !isProduction &&
            Debugger.logImageStats(scans, 'The postprocessed photo.');

          finishScanning(scans);
        }
      }
    });
  }

  /**
   * Runs OCR and tag validation on a list of blobs until a result is obtained or it reaches the end of the list.
   */
  public async ocr(scans: Blob[]): Promise<TagSummaryDto[]> {
    this._OCR.refreshAttemptId();

    const timers: Timers = {
      networkRequestTimeTaken: 0,
      OCRPostprocessingTimeTaken: 0,
      validationTimeTaken: 0
    };

    for (let i = 0; i < scans.length; i++) {
      const ocrResult = await this._OCR.runOCR(scans[i]);

      // A null value indicates the Computer Vision usage quota was exceeded.
      if (ocrResult !== null) {
        const { ocrResponse, networkRequestTimeTaken, postOCRTimeTaken } =
          ocrResult;
        timers.networkRequestTimeTaken += networkRequestTimeTaken;
        timers.OCRPostprocessingTimeTaken += postOCRTimeTaken;

        if (ocrResponse.length >= 1) {
          const { validatedTags, validationLogEntry } =
            await this._OCR.handleValidation(ocrResponse);
          timers.validationTimeTaken += validationLogEntry?.timeTaken ?? 0;

          if (validatedTags.length >= 1) {
            timers.validationTimeTaken = validationLogEntry?.timeTaken ?? 0;
            logScanningAttempt.call(this, validationLogEntry, timers);

            return validatedTags;
          } else {
            logScanningAttempt.call(this, validationLogEntry, timers);
          }
        }
      }
    }

    return [];
  }
}
