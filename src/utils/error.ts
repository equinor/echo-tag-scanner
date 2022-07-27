import { ErrorRecord } from '@enums';
import { EchoCameraError } from '@types';
import { BaseError, eventHub } from '@equinor/echo-base';
/**
 * Transmits a thrown error to the event hub so that it may be handled on next rerender.
 */
function handleError(record: ErrorRecord, error: Error | BaseError | unknown) {
  if (error instanceof BaseError || error instanceof Error) {
    eventHub.emit(record.key, {
      severity: record.severity || 'low',
      userMessage: record.userMessage,
      devMessage: error
    } as EchoCameraError);
  }
}
export { handleError };
