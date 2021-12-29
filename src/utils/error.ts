import { ErrorRecord } from '@enums';
import { EchoCameraError } from '@types';
import { eventHub } from '@equinor/echo-base';
import { BaseApiClientError } from '@services';
/**
 * Transmits a thrown error to the event hub so that it may be handled on next rerender.
 */
function handleError(record: ErrorRecord, devMessage: Error | BaseApiClientError): void {
  const errorToEmit = {
    severity: record.severity || 'low',
    userMessage: record.userMessage,
    devMessage: undefined
  } as EchoCameraError;

  if (devMessage instanceof BaseApiClientError) {
    errorToEmit.devMessage = devMessage.originalError;
  } else {
    errorToEmit.devMessage = devMessage;
  }
  eventHub.emit(record.key, errorToEmit);
}

export { handleError };
