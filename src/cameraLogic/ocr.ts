import { BackendError } from '@equinor/echo-base';
import { ComputerVisionResponse, ParsedComputerVisionResponse } from '@types';
import { handleError, logger, filterer } from '@utils';
import { ErrorRegistry } from '@const';
import { baseApiClient } from '../services/api/base/base';
import { getComputerVisionOcrResources } from '../services/api/resources/resources';
import { Search, TagSummaryDto } from '@equinor/echo-search';
import { randomBytes } from 'crypto';

import tagNumbers from '../tagnumbers.json';
console.log('%c⧭', 'color: #997326', tagNumbers);

export class OCR {
  private _attemptId?: string = undefined;

  /** Generates a pseudorandom sequence of 16 bytes and returns them hex encoded. */
  public get attemptId(): string {
    return randomBytes(16).toString('hex');
  }

  //TODO: Handle possible errors on randomBytes call.
  public refreshAttemptId(): string {
    const newId = randomBytes(16).toString('hex');
    this._attemptId = newId;
    return newId;
  }

  public async runOCR(scan: Blob): Promise<ParsedComputerVisionResponse> {
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
          let nextWord = word.text.trim();
          if (
            nextWord &&
            filterer.hasEnoughCharacters(nextWord) &&
            (filterer.lettersAreValid(nextWord) ||
              filterer.isMotorTag(nextWord)) &&
            filterer.hasTwoIntegers(nextWord)
          ) {
            possibleTagNumbers.push(nextWord);
          }
        })
      )
    );

    return possibleTagNumbers;
  }

  public testFiltration() {
    const { withoutInstCode, withInstCode, motors } = tagNumbers;
    console.group('Testing fails');
    withoutInstCode.forEach((tag) => {
      if (
        tag &&
        filterer.hasEnoughCharacters(tag) &&
        (filterer.lettersAreValid(tag) || filterer.isMotorTag(tag)) &&
        filterer.hasTwoIntegers(tag)
      ) {
        console.info(tag + ' was validated.');
      } else console.info(tag + ' was NOT validated');
    });
    console.groupEnd();

    console.group('Testing succeeds');
    withInstCode.forEach((tag) => {
      if (
        tag &&
        filterer.hasEnoughCharacters(tag.value) &&
        (filterer.lettersAreValid(tag.value) ||
          filterer.isMotorTag(tag.value)) &&
        filterer.hasTwoIntegers(tag.value)
      ) {
        console.info(tag.value + ' was validated.');
      } else console.info(tag.value + ' was NOT validated');
    });
    console.groupEnd();

    console.group('Testing motors');
    motors.forEach((motor) => {
      if (
        motor &&
        filterer.hasEnoughCharacters(motor.value) &&
        (filterer.lettersAreValid(motor.value) ||
          filterer.isMotorTag(motor.value)) &&
        filterer.hasTwoIntegers(motor.value)
      ) {
        console.info(motor.value + ' was validated.');
      } else console.info(motor.value + ' was NOT validated');
    });
    console.groupEnd();
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
    tagValidationResults.forEach((validationResult) => {
      if (!this._attemptId)
        throw new Error('A pseudoranom log entry ID has not been established.');
      // Log the successfull OCR.
      if (validationResult.status === 'fulfilled') {
        const logEntry = {
          id: this._attemptId,
          isSuccess: true,
          readText: validationResult.value.testValue,
          validatedText: validationResult.value.validatedTagSummary.tagNo
        };
        logger.scanAttempt(logEntry);
        logger.log('QA', () =>
          console.info('A successful OCR was logged: ', logEntry)
        );

        // Record the fetched tag summary for use later in presentation.
        validatedTags.push(validationResult.value.validatedTagSummary);
      } else if (validationResult.status === 'rejected') {
        if ((validationResult.reason as FailedTagValidation).EchoSearchError) {
          // TODO: Handle or log Echo search errors here
        } else {
          // Log the failed OCR.
          const failedLogEntry = {
            id: this._attemptId,
            isSuccess: false,
            validatedText: undefined,
            readText: (validationResult.reason as FailedTagValidation).testValue
          };
          logger.scanAttempt(failedLogEntry);
          logger.log('QA', () =>
            console.info('A failed OCR was logged: ', failedLogEntry)
          );
        }
      }
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
      } else {
        logger.log('QA', () => {
          console.group('Running validation for ', possibleTagNumber);
          console.info(
            'Echo Search could not establish a close match to ' +
              possibleTagNumber
          );
          console.groupEnd();
        });
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

    type TagValidationResult = {
      validatedTagSummary: TagSummaryDto;
      testValue: string;
    };

    type FailedTagValidation = {
      EchoSearchError?: unknown;
      testValue: string;
    };
    /**
     * Returns a promise to validate a string as a tag number.
     * @fulfill {TagValidationResult} The {TagSummaryDto} and the test value.
     * @reject {FailedValidation} The test value
     */
    async function createTagValidator(
      testValue: string
    ): Promise<TagValidationResult> {
      return new Promise((resolve, reject) => {
        findClosestTag(testValue).then((closestTagMatch) => {
          if (closestTagMatch) {
            getTagSummary(closestTagMatch)
              .then((res) =>
                resolve({
                  validatedTagSummary: res,
                  testValue: testValue
                } as TagValidationResult)
              )
              // An error was caught from Echo-search
              .catch((reason) => {
                reject({
                  EchoSearchError: reason,
                  testValue: testValue
                } as FailedTagValidation);
              });
          } else {
            reject({ testValue: testValue } as FailedTagValidation);
          }
        });
      });
    }
  }
}
