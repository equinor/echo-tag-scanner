import { Search, TagSummaryDto } from '@equinor/echo-search';

import {
  FailedTagValidation,
  OCRPayload,
  ParsedComputerVisionResponse,
  TagValidationResult,
  ValidationStats
} from '@types';
import { Timer, filterBy, isProduction } from '@utils';
import { Debugger } from '@cameraLogic';

export interface OCRValidator {
  handleValidation(
    attemptId: string,
    unvalidatedTags: ParsedComputerVisionResponse
  ): Promise<{
    validatedTags: TagSummaryDto[];
    validationLogEntry?: OCRPayload;
  }>;
}
export class AzureOCRValidator implements OCRValidator {
  public async handleValidation(
    attemptId: string,
    unvalidatedTags: ParsedComputerVisionResponse
  ): Promise<{
    validatedTags: TagSummaryDto[];
    validationLogEntry?: OCRPayload;
  }> {
    const tagValidationTasks = unvalidatedTags.map((funcLocation) =>
      this.createTagValidator(funcLocation)
    );
    const tagValidationResults = await Promise.allSettled([
      ...tagValidationTasks
    ]);
    const validatedTags: TagSummaryDto[] = [];
    const validationStats: ValidationStats[] = [];
    let logEntry: OCRPayload | undefined;

    tagValidationResults.forEach((validationResult) => {
      if (!attemptId)
        throw new Error('A pseudoranom log entry ID has not been established.');
      // Log the successfull OCR.
      if (validationResult.status === 'fulfilled') {
        logEntry = {
          id: attemptId,
          isSuccess: true,
          readText: validationResult.value.testValue,
          validatedText: validationResult.value.validatedTagSummary.tagNo,
          timeTaken: validationResult.value.timeTaken
        };

        // Record the fetched tag summary for use later in presentation.
        validatedTags.push(validationResult.value.validatedTagSummary);
        validationStats.push({
          isSuccess: true,
          testValue: validationResult.value.testValue,
          correction: validationResult.value.validatedTagSummary.tagNo
        });
      } else if (validationResult.status === 'rejected') {
        if ((validationResult.reason as FailedTagValidation).EchoSearchError) {
          throw new Error(validationResult.reason);
          // TODO: Handle or log Echo search errors here
        } else {
          // Log the failed OCR.
          logEntry = {
            id: attemptId,
            isSuccess: false,
            validatedText: undefined,
            readText: (validationResult.reason as FailedTagValidation)
              .testValue,
            timeTaken: validationResult.reason.timeTaken
          };
          validationStats.push({
            isSuccess: false,
            testValue: logEntry.readText
          });
        }
      }
    });

    !isProduction && Debugger.reportValidation(validationStats);
    return {
      validatedTags: filterBy<TagSummaryDto>('tagNo', validatedTags),
      validationLogEntry: logEntry
    };
  }

  /**
   * Accepts a possible tag number as string value and runs it through Echo Search for validation.
   */
  public async findClosestTag(possibleTagNumber: string) {
    const result = await Search.Tags.closestTagAsync(possibleTagNumber);
    if (result.isSuccess) {
      return result.value;
    }
  }

  /**
   * Accepts a validated tag and fetches its tag summary locally.
   */
  public async getTagSummary(validationResult: string): Promise<TagSummaryDto> {
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
   * @fulfill {TagValidationResult} The {TagSummaryDto} and the test value.
   * @reject {FailedValidation} The test value
   */
  public async createTagValidator(
    testValue: string
  ): Promise<TagValidationResult> {
    return new Promise((resolve, reject) => {
      const validationTimer = new Timer();
      validationTimer.start();
      this.findClosestTag(testValue).then((closestTagMatch) => {
        if (closestTagMatch) {
          this.getTagSummary(closestTagMatch)
            .then((tagSummary) =>
              resolve({
                validatedTagSummary: tagSummary,
                testValue: testValue,
                timeTaken: validationTimer.stop()
              } as TagValidationResult)
            )
            // An error was caught from Echo-search
            .catch((reason) => {
              reject({
                EchoSearchError: reason,
                testValue: testValue,
                timeTaken: validationTimer.stop()
              } as FailedTagValidation);
            });
        } else {
          reject({
            testValue: testValue,
            timeTaken: validationTimer.stop()
          } as FailedTagValidation);
        }
      });
    });
  }
}
