import { eventHub } from '@equinor/echo-base';
import { getFunctionalLocationsResources } from '../resources/resources';
import { baseApiClient } from '../base/base';
import { ErrorRecord, ErrorRegistry } from '@enums';
import { EchoCameraError } from '@types';

export async function getFunctionalLocations(image: Blob): Promise<unknown> {
  try {
    const { url, body } = getFunctionalLocationsResources(image);
    return await baseApiClient.postAsync(url, body);
  } catch (error) {
    throw handleError(ErrorRegistry.ocrError, error);
  }
}

function handleError(record: ErrorRecord, devMessage: unknown) {
  if (devMessage instanceof Error) {
    eventHub.emit(record.key, {
      severity: record.severity || 'low',
      userMessage: record.userMessage,
      devMessage: devMessage
    } as EchoCameraError);
  }
}
