import { BackendError } from '@equinor/echo-base';
import { ComputerVisionResponse, ParsedComputerVisionResponse } from '@types';
import { handleError, logger, ScanAttempt } from '@utils';
import { ErrorRegistry } from '@const';
import { baseApiClient } from '../services/api/base/base';
import { getComputerVisionOcrResources } from '../services/api/resources/resources';
import { Search, TagSummaryDto } from '@equinor/echo-search';
import { randomBytes } from 'crypto';

export class OCR {
  private _attemptLog: ScanAttempt[] | undefined = undefined;
  private _attemptId: string = this.getAttemptId();

  /** Generates a pseudorandom sequence of 16 bytes and returns them hex encoded. */
  private getAttemptId() {
    return randomBytes(16).toString('hex');
  }

  public async runOCR(scan: Blob): Promise<ParsedComputerVisionResponse> {
    this._attemptId = this.getAttemptId();
    const [url, body, init] = getComputerVisionOcrResources(scan);
    try {
      const response = await baseApiClient.postAsync<ComputerVisionResponse>(
        url,
        body,
        init
      );

      const parsedResponse = this.handleFiltration(response.data);
      return parsedResponse;
    } catch (error) {
      if (error instanceof BackendError && error.httpStatusCode === 429) {
        // Here we handle the event where users might go over the Computer vision usage quota.
        // We do not percieve this as an error on the client side. The user will simply try again.
        logger.log('EchoDevelopment', () =>
          console.warn(
            'The scan operation resulted in an overload in the usage quota for Computer Vision. This is normally not a problem and we simply return empty results to the users. This will prompt them to try again.'
          )
        );
        return [];
      } else {
        logger.log('QA', () => console.error('API Error -> ', error));
        throw handleError(ErrorRegistry.ocrError, error as Error);
      }
    }
  }

  private handleFiltration(
    response: ComputerVisionResponse
  ): ParsedComputerVisionResponse {
    const possibleTagNumbers: string[] = [];
    response.regions.forEach((region) =>
      region.lines.forEach((line) =>
        line.words.forEach((word) => {
          if (word.text && word.text.length >= 5) {
            possibleTagNumbers.push(word.text);
          }
        })
      )
    );
    return possibleTagNumbers;
  }

  public async handleValidation(
    unvalidatedTags: ParsedComputerVisionResponse
  ): Promise<TagSummaryDto[]> {
    const tagValidationTasks = unvalidatedTags.map((funcLocation) =>
      createTagValidator(funcLocation)
    );
    const tagValidationResults = await Promise.allSettled([
      ...tagValidationTasks
    ]);
    const validatedTags: TagSummaryDto[] = [];
    tagValidationResults.forEach((res) => {
      if (res.status === 'fulfilled') validatedTags.push(res.value);
    });

    return validatedTags;

    /**
     * Accepts a possible tag number as string value and runs it through Echo Search for validation.
     */
    async function findClosestTag(possibleTagNumber: string) {
      const result = await Search.Tags.closestTagAsync(possibleTagNumber);
      if (result.isSuccess) {
        logger.log('QA', () => {
          console.group('Running validation for ', possibleTagNumber);
          console.info(possibleTagNumber + ' corrected to ' + result.value);
          console.groupEnd();
        });
        return result.value;
      }
    }

    /**
     * Accepts a validated tag and fetches its tag summary locally.
     */
    async function getTagSummary(
      validationResult: string
    ): Promise<TagSummaryDto> {
      return new Promise((resolve, reject) => {
        Search.Tags.getAsync(validationResult).then((result) => {
          if (result.isSuccess && result.value != null) {
            resolve(result.value);
          } else {
            reject(result.value);
          }
        });
      });
    }

    /**
     * Returns a promise to validate a string as a tag number.
     */
    async function createTagValidator(
      possibleTagNumber: string
    ): Promise<TagSummaryDto> {
      return new Promise((resolve, reject) => {
        findClosestTag(possibleTagNumber).then((closestTagMatch) => {
          if (closestTagMatch) resolve(getTagSummary(closestTagMatch));
          else reject(closestTagMatch);
        });
      });
    }
  }
}
