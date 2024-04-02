import { deviceInfo } from '@equinor/echo-utils';

import { logger } from '@utils';
import { CoreCamera, TagScanner } from '@cameraLogic';
import {
  CroppingStats,
  FlatScanAttemptLogEntry,
  NewCaptureEventDetail,
  ValidationStats
} from '@types';

export class Debugger {
  public static startupLogs(tagScanner: TagScanner) {
    console.group('Starting up Echo Tag Scanner.');
    console.info('Orientation -> ', tagScanner.currentOrientation);
    console.info(
      'Orientation handler -> ',
      tagScanner.orientationChangeHandler || 'No orientation handler set.'
    );
    console.info(
      `Resolution -> ${tagScanner.videoTrackSettings?.width}x${tagScanner.videoTrackSettings?.height}@${tagScanner.videoTrackSettings?.frameRate}fps.`
    );
    console.table(deviceInfo.getDeviceDetails());
    console.groupEnd();
  }
  /**
   * Logs image statistics to the console.
   */
  public static logImageStats(
    captures: Array<Blob | File>,
    logDescription?: string,
    captureTimeTaken?: number
  ) {
    if (captures.length > 0) {
      const averageSize =
        captures.reduce(
          (accTotalSize, nextBlob) => accTotalSize + nextBlob.size,
          0
        ) / captures.length;

      console.group(logDescription);
      console.info('Number of captures -> ', captures.length);
      console.info('Average size in bytes -> ', averageSize);
      console.info('Media type -> ', captures[0].type);
      console.info(
        'Capture time taken -> ',
        captureTimeTaken + ' milliseconds.'
      );
      console.groupEnd();
    }
  }

  /**
   * Returns a stringified short report of the users device and configuration.
   */
  public static async clipboardThis(tagScanner: TagScanner) {
    return `
Camera software Information
#################################
Camera resolution:
   ${tagScanner.viewfinder.videoWidth}x${tagScanner.viewfinder.videoHeight}@${
     tagScanner.videoTrack?.getSettings().frameRate
   }fps.
Aspect ratio: ${
      tagScanner.viewfinder.videoWidth / tagScanner.viewfinder.videoHeight
    }

Viewfinder resolution (in CSS pixels):
    ${tagScanner.viewfinder.width}x${tagScanner.viewfinder.height}.

Camera is torch capable:
    ${Boolean(tagScanner.capabilities?.torch)}.

Camera zoom: ${tagScanner.zoomMethod.type} at max ${
      tagScanner.zoomMethod.max
    }x zoom.

MediaStream details:
${tagScanner.mediaStream.toString()}

Videotrack details:
${tagScanner.videoTrack?.toString()}

Camera hardware Information
#################################
All media devices:
${await getHRDevices.call(tagScanner)}

Current camera hardware:
${getReadableVideotrackSettings.call(tagScanner)}

Current orientation:
${tagScanner.currentOrientation}

Scanning Area
#################################
${getScanningAreaInfo.call(tagScanner)}


`;

    function getReadableVideotrackSettings(this: CoreCamera) {
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

    function getHRDevices(this: CoreCamera): Promise<string> {
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

    function getScanningAreaInfo(this: CoreCamera) {
      const captureArea = document.getElementById('scanning-area');

      if (!captureArea) {
        logger.log('QA', () =>
          console.warn('A reference to the capture area was not obtainable')
        );
        return undefined;
      }
      const scanningAreaWidth = captureArea.clientWidth;
      const scanningAreaHeight = captureArea.clientHeight;
      const sx = this.viewfinder.videoWidth / 2 - scanningAreaWidth / 2;
      const sy = this.viewfinder.videoHeight / 2 - scanningAreaHeight / 2;

      return `
Dimensions: ${scanningAreaWidth}x${scanningAreaHeight}
Intrinsic offset from top: ${sy}.
Intrinsic offset from left-edge: ${sx}.
`;
    }
  }

  public static async debugAll(previewCapture = false, tagScanner: TagScanner) {
    if (previewCapture) {
      const scanningArea = document.getElementById('scanning-area');

      if (scanningArea) {
        // Scan here
        const scans = await tagScanner.scan();
        Debugger.notifyNewCapture(...scans);
      }
    }
    logger.log('EchoDevelopment', () => {
      console.info(
        'Camera resolution -> ',
        tagScanner.viewfinder.videoWidth +
          'x' +
          tagScanner.viewfinder.videoHeight +
          '@' +
          tagScanner.videoTrack?.getSettings().frameRate +
          'fps'
      );
    });
  }

  public static reportHomoglypSubstitution(original: string, altered: string) {
    logger.log('QA', () => {
      console.info(
        `After homoglyph substitution, the string ${original} was changed to ${altered}`
      );
    });
  }

  public static reportCropping(stats: CroppingStats, tagScanner: TagScanner) {
    logger.log('EchoDevelopment', () => {
      console.group('Cropping');
      console.info('X: ', stats.sx);
      console.info('Y: ', stats.sy);
      console.info(
        'Crop dimensions: ',
        `${stats.cropWidth}x${stats.cropHeight}`
      );
      console.info('Zoom: ', stats.zoom);
      console.info(
        'Viewfinder: ',
        tagScanner.viewfinder.videoWidth +
          'x' +
          tagScanner.viewfinder.videoHeight
      );
      console.groupEnd();
    });
  }

  public static reportFiltration(possibleTagNumbers: string[]) {
    if (possibleTagNumbers.length > 0) {
      console.group('Filtration results.');
      console.info('The following strings are possible tag numbers:');
      possibleTagNumbers.forEach((possTag) => console.info(possTag));
      console.groupEnd();
    }
  }

  public static reportValidation(validations: ValidationStats[]) {
    console.group('Echo-Search validation results.');
    if (validations.length > 0) {
      console.group('The following tag numbers have been validated:');

      validations.forEach((validation) => {
        if (validation.isSuccess) {
          console.info('Validated value -> ', validation.testValue);

          if (validation.testValue !== validation.correction) {
            console.info(
              `The tag number was corrected from ${validation.testValue} to ${validation.correction}.`
            );
          }
        } else {
          console.info('Failed validation -> ', validation.testValue);
        }
      });
      console.groupEnd();
    } else {
      console.info('No validation results to display.');
    }
    console.groupEnd();
  }

  public static reportLogEntry(logEntry: FlatScanAttemptLogEntry) {
    logger.log('QA', () => {
      if ('isSuccess' in logEntry && logEntry.isSuccess) {
        console.group('A successfull log entry was created.');
        console.info(logEntry);
        console.groupEnd();
      } else {
        console.group('A failed log entry was created.');
        console.info(logEntry);
        console.groupEnd();
      }
    });
  }

  /**
   * Accepts a new capture, creates an object URL from it and dispatches an event containing the new object URL.
   */
  public static notifyNewCapture(...newCaptures: Blob[]) {
    globalThis.dispatchEvent(
      new CustomEvent<NewCaptureEventDetail>('ets-capture', {
        detail: { captures: newCaptures }
      })
    );
  }
}
