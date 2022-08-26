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
      globalThis.stopStream = () => {
        this.videoTrack?.stop();
        this.videoTrack?.dispatchEvent(new Event('ended'));
      };
    }
  }

  /**
   * Returns a stringified short report of the users device and configuration.
   */
  public async clipboardThis() {
    return `
Camera Information
#################################
Camera resolution: 
   ${this.viewfinder.videoWidth}x${this.viewfinder.videoHeight}@${
      this.videoTrack?.getSettings().frameRate
    }fps.
Viewfinder resolution (in CSS pixels): 
    ${this.viewfinder.width}x${this.viewfinder.height}.
Camera is torch capable: 
    ${Boolean(this.capabilities?.torch)}.
Camera is zoom capable: ${Boolean(this.capabilities?.zoom)}.
${getReadableVideotrackSettings.call(this)}
Current camera facing mode: 
    ${this.activeCamera}
MediaStream details:
    ${this.mediaStream.toString()}
Videotrack details:
    ${this.videoTrack?.toString()}

Scanning Area
#################################
${getCaptureAreaInfo.call(this)}

Device information
#################################
User agent:
    ${navigator.userAgent}
Cameras:
    ${await getHRDevices.call(this)}
Current orientation: 
    ${this.currentOrientation}

`;

    function getReadableVideotrackSettings(this: TagScanner) {
      let text = '';
      if (this.videoTrackSettings) {
        Object.keys(this.videoTrackSettings).forEach((key) => {
          //@ts-expect-error
          text += `${key}: ${this.videoTrackSettings[key]}\n`;
        });
      } else {
        text += 'Could not get video tracks';
      }

      return text;
    }

    function getHRDevices(this: TagScanner): Promise<string> {
      return new Promise((resolve) => {
        let text = '';
        if (navigator.mediaDevices) {
          navigator.mediaDevices.enumerateDevices().then((devices) => {
            devices.forEach((device) => {
              text += device.label + '\n';
            });
            resolve(text);
          });
        } else {
          resolve('Could not enumerate media devices.');
        }
      });
    }

    function getCaptureAreaInfo(this: TagScanner) {
      const captureArea = document.getElementById('scan-area');

      if (!captureArea) {
        logger.log('QA', () =>
          console.warn('A reference to the capture area was not obtainable')
        );
        return undefined;
      }
      const bcr = captureArea.getBoundingClientRect();
      const sx = this.viewfinder.videoWidth / 2 - bcr.width / 2;
      const sy = this.viewfinder.videoHeight / 2 - bcr.height / 2;

      return `
Dimensions: ${bcr.width}x${bcr.height}
Intrinsic offset from top: ${sy}.
Intrinsic offset from left-edge: ${sx}.
Regular offset from top: ${bcr.y};
Regular offset from left-edge: ${bcr.x};
`;
    }
  }

  public async debugAll(previewCapture = false) {
    navigator.clipboard.writeText(await this.clipboardThis());

    const scanArea = document.getElementById('scan-area');
    if (previewCapture && scanArea) {
      let capture = await this.capturePhoto(scanArea.getBoundingClientRect());
      if (capture.size > 50000) capture = await this.scale(0.5);
    }
    logger.log('EchoDevelopment', () => {
      console.log('Mediastream -> ', this.mediaStream);
      console.log('The viewfinder -> ', this.viewfinder);
      console.log('The video track -> ', this.videoTrack);
      console.log('Camera settings -> ', this.videoTrackSettings);
      console.log('Current orientation -> ', this.currentOrientation);
      console.log(
        'Camera is torch capable -> ',
        Boolean(this.capabilities?.torch)
      );
      console.log(
        'Camera is zoom capable -> ',
        Boolean(this.capabilities?.zoom)
      );
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
   * @param area A bounding box for which the capture is cropped from.
   * @returns {Blob[]} A list of blobs.
   */
  public async scan(area: DOMRect): Promise<Blob[]> {
    return new Promise((resolve) => {
      const scans: Blob[] = [];
      const interval = (this._scanRetries / this._scanDuration) * 100;
      const intervalId = setInterval(async () => {
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
      } else logger.log('QA', () => console.info('OCR returned no results'));
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
      logger.log('QA', () =>
        console.info(`Tag validation took ${timeMS} milliseconds.`)
      );
      return result;
    } else {
      return [];
    }
  }
}
