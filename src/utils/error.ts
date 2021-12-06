import { ErrorRecord } from '@enums';
import { EchoCameraError } from '@types';
import { eventHub } from '@equinor/echo-base';

/**
 * Transmits a thrown error to the event hub so that it may be handled on next rerender.
 */
function handleError(record: ErrorRecord, devMessage: unknown): void {
  if (devMessage instanceof Error) {
    eventHub.emit(record.key, {
      severity: record.severity || 'low',
      userMessage: record.userMessage,
      devMessage: devMessage?.originalError ?? devMessage
    } as EchoCameraError);
  }
}

export { handleError };
