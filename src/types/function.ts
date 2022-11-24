import { OCRPayload, ScanAttempt } from '@types';
import { TagScanner } from '@cameraLogic';

/** Accepts a parsed payload from the OCR step, appends this to the log entry and relays to AppInsights. */
export type ScanAttemptLogEntryCallback = (
  this: TagScanner,
  ocrResult: OCRPayload
) => ScanAttempt;
