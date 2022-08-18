import { CameraProps, ParsedComputerVisionResponse } from '@types';
import { ocrRead } from '@services';
import { isDevelopment, logger, runTagValidation } from '@utils';
import { TagSummaryDto } from '@equinor/echo-search';
import { Camera } from './Camera';

/**
 * This object implements tag scanning logic.
 */
export class TagScanner extends Camera {
  private _scanRetries = 5;
  private _scanDuration = 2; //seconds

  constructor(props: CameraProps) {
    super(props);

    if (isDevelopment) {
      globalThis.setScanRetires = (r: number) => (this._scanRetries = r);
      globalThis.setScanDuraction = (t: number) => (this._scanDuration = t);
      globalThis.pause = () => this.pauseViewfinder();
      globalThis.resume = () => this.resumeViewfinder();
      globalThis.debugCamera = (preview) => this.debugAll(preview);
      globalThis.refresh = () => this.refreshStream();
      globalThis.toggleCamera = async () =>
        await this.refreshStream(Boolean('toggleCamera'));
    }
  }

  public async debugAll(previewCapture = false) {
    const scanArea = document.getElementById('scan-area');
    if (previewCapture && scanArea) {
      let capture = await this.capturePhoto(scanArea.getBoundingClientRect());
      if (capture.size > 50000) capture = await this.scale(0.5);
    }

    console.log('Mediastream -> ', this.mediaStream);
    console.log('The viewfinder -> ', this.viewfinder);
    console.log('The video track -> ', this.videoTrack);
    console.log('Camera settings -> ', this.videoTrackSettings);
    console.log('Current orientation -> ', this.currentOrientation);
    console.log(
      'Camera is torch capable -> ',
      Boolean(this.capabilities?.torch)
    );
    console.log('Camera is zoom capable -> ', Boolean(this.capabilities?.zoom));
    console.log(
      'Camera resolution -> ',
      this.viewfinder.videoWidth +
        'x' +
        this.viewfinder.videoHeight +
        '@' +
        this.videoTrack?.getSettings().frameRate +
        'fps'
    );
    console.log(
      'Viewport (CSS pixel) resolution -> ',
      this.viewfinder.width + 'x' + this.viewfinder.height
    );
    console.log('Number of captures -> ', this._scanRetries);
    console.log('Scanning duration ->', this._scanDuration);
  }

  // Prepare for a new scan by resetting the camera.
  public async prepareNewScan() {
    this.canvasHandler.clearCanvas();
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
      const intervalId = setInterval(async () => {
        console.group('NEW SCAN STARTED');
        console.info('crop area ->', area.width, area.height);
        console.groupEnd();
        let capture = await this.capturePhoto(area);
        if (capture.size > 50000) capture = await this.scale(0.5);
        scans.push(capture);

        // Log some image stats and a blob preview in network tab.
        this.logImageStats(capture, 'The postprocessed photo.');
        if (scans.length === this._scanRetries) {
          clearInterval(intervalId);
          resolve(scans);
        }
      }, interval);
    });
  }

  /**
   * Runs OCR and tag validation on a list of blobs until a result is obtained or it reaches the end of the list.
   */
  public async ocr(scans: Blob[]): Promise<TagSummaryDto[]> {
    for (let i = 0; i < scans.length; i++) {
      var ocrResult = await ocrRead(scans[i]);
      if (ocrResult.length >= 1) {
        var validation = await this.validateTags(ocrResult);
        if (validation.length >= 1) return validation;
      } else logger.log('Info', () => console.info('OCR returned no results'));
    }

    return [];
  }

  /**
   * Accepts a list of possible tag numbers and returns a filtered list containing tags which are
   * available in IndexedDB.
   */
  public async validateTags(
    possibleTagNumbers: ParsedComputerVisionResponse
  ): Promise<TagSummaryDto[]> {
    if (Array.isArray(possibleTagNumbers) && possibleTagNumbers.length > 0) {
      const beforeValidation = new Date();
      const result = await runTagValidation(possibleTagNumbers);
      const afterValidation = new Date();
      const timeMS =
        afterValidation.getMilliseconds() - beforeValidation.getMilliseconds();
      logger.log('Info', () =>
        console.info(`Tag validation took ${timeMS} milliseconds.`)
      );
      return result;
    } else {
      return [];
    }
  }
}
