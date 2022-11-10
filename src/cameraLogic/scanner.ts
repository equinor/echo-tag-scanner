import { CameraProps, ZoomSteps } from '@types';
import { isDevelopment, logger } from '@utils';
import { TagSummaryDto } from '@equinor/echo-search';
import { Camera, OCR } from '.';

/**
 * This object implements tag scanning logic.
 */
export class TagScanner extends Camera {
  private _scanRetries = 5;
  private _scanDuration = 2; //seconds
  private _OCR = new OCR();
  private _scanningArea: HTMLElement;

  constructor(props: CameraProps) {
    super(props);
    this._scanningArea = props.scanningArea;
    if (isDevelopment) {
      globalThis.setScanRetires = (r: number) => (this._scanRetries = r);
      globalThis.setScanDuraction = (t: number) => (this._scanDuration = t);
      globalThis.pause = () => this.pauseViewfinder();
      globalThis.resume = () => this.resumeViewfinder();
      globalThis.debugCamera = (preview) => this.debugAll(preview);
      globalThis.refresh = () => this.refreshStream();
      globalThis.toggleCamera = async () => await this.refreshStream();
      globalThis.stopStream = () => {
        this.videoTrack?.stop();
        this.videoTrack?.dispatchEvent(new Event('ended'));
      };
      globalThis.simZoom = (newZoom: ZoomSteps) => this.alterZoom(newZoom);
    }
  }

  /**
   * Returns a stringified short report of the users device and configuration.
   */
  public async clipboardThis() {
    return `
Camera software Information
#################################
Camera resolution:
   ${this.viewfinder.videoWidth}x${this.viewfinder.videoHeight}@${
      this.videoTrack?.getSettings().frameRate
    }fps.

Viewfinder resolution (in CSS pixels):
    ${this.viewfinder.width}x${this.viewfinder.height}.

Camera is torch capable:
    ${Boolean(this.capabilities?.torch)}.

Camera zoom: ${this.zoomMethod.type} at max ${this.zoomMethod.max}x zoom.

MediaStream details:
${this.mediaStream.toString()}

Videotrack details:
${this.videoTrack?.toString()}

Camera hardware Information
#################################
All media devices:
${await getHRDevices.call(this)}

Current camera hardware:
${getReadableVideotrackSettings.call(this)}

Current orientation:
${this.currentOrientation}

Scanning Area
#################################
${getScanningAreaInfo.call(this)}


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

    function getScanningAreaInfo(this: TagScanner) {
      const captureArea = document.getElementById('scanning-area');

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

  public async performCropping(): Promise<Blob> {
    const scanningAreaWidth = this._scanningArea.getBoundingClientRect().width;
    const scanningAreaHeight =
      this._scanningArea.getBoundingClientRect().height;

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

    console.group('Cropping');
    console.info('sx', sx);
    console.info('sy', sy);
    console.info('draw: ', `${scanningAreaWidth}x${scanningAreaHeight}`);
    console.info('zoom', this.zoom);
    console.groupEnd();

    return await this.crop({
      sx,
      sy,
      sWidth: cropWidth,
      sHeight: cropHeight
    });
  }

  public async debugAll(previewCapture = false) {
    if (previewCapture) {
      const scanningArea = document.getElementById('scanning-area');

      if (scanningArea) {
        this.prepareNewScan();
        let capture = await this.capturePhoto();
        capture = await this.performCropping();
        const { width, height } = this._scanningArea.getBoundingClientRect();
        capture = await this._canvasHandler.getCanvasContentAsBlob({
          sWidth: width / this.zoom,
          sHeight: height / this.zoom
        });

        this.notifyNewCapture(capture);
      }
    }
    logger.log('EchoDevelopment', () => {
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
      const { width, height } = this._scanningArea.getBoundingClientRect();
      const extractWidth = width / this.zoom;
      const extractHeight = height / this.zoom;

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
        // if (capture.size > 50000) capture = await this.scale(0.5);
        scans.push(capture);

        // Log some image stats and a blob preview in network tab.
        this.logImageStats(capture, 'The postprocessed photo.');

        if (scans.length === this._scanRetries) {
          // Scanning is finished.
          clearInterval(intervalId);
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
    for (let i = 0; i < scans.length; i++) {
      const filteredResponse = await this._OCR.runOCR(scans[i]);
      if (filteredResponse.length >= 1) {
        var validation = await this._OCR.handleValidation(filteredResponse);
        if (validation.length >= 1) {
          return validation;
        } else {
          logger.log('QA', () =>
            console.info(
              'OCR returned no results that was validated by Echo-Search.'
            )
          );
        }
      } else {
        logger.log('QA', () =>
          console.info(
            'OCR returned no results that made it through the filtering step.'
          )
        );
      }
    }

    return [];
  }
}
