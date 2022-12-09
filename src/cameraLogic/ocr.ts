import { BackendError } from '@equinor/echo-base';
import {
  ComputerVisionResponse,
  FailedTagValidation,
  OCRPayload,
  ParsedComputerVisionResponse,
  TagValidationResult,
  ValidationStats
} from '@types';
import {
  handleError,
  logger,
  ocrFilterer,
  logScanningAttempt,
  isProduction
} from '@utils';
import { ErrorRegistry } from '@const';
import { baseApiClient } from '../services/api/base/base';
import { getComputerVisionOcrResources } from '../services/api/resources/resources';
import { Search, TagSummaryDto } from '@equinor/echo-search';
import { randomBytes } from 'crypto';
import { TagScanner } from '@cameraLogic';
import { Debugger } from './debugger';

interface OCRProps {
  tagScanner: TagScanner;
}

export class OCR {
  private _attemptId?: string;
  private _tagScannerRef: TagScanner;

  constructor(props: OCRProps) {
    this._attemptId = undefined;
    this._tagScannerRef = props.tagScanner;
  }

  /** Generates a pseudorandom sequence of 16 bytes and returns them hex encoded. */
  public get attemptId(): string {
    return randomBytes(16).toString('hex');
  }

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
    const filteredWords: string[] = [];
    response.regions.forEach((region) =>
      region.lines.forEach((line) =>
        line.words.forEach((word) => {
          let nextWord = word.text.trim();
          nextWord = ocrFilterer.filterLeadingChar(nextWord);
          nextWord = ocrFilterer.filterTrailingChar(nextWord);
          if (
            nextWord &&
            ocrFilterer.hasEnoughCharacters(nextWord) &&
            (ocrFilterer.lettersAreValid(nextWord) ||
              ocrFilterer.isMotorTag(nextWord)) &&
            ocrFilterer.hasTwoIntegers(nextWord)
          ) {
            possibleTagNumbers.push(nextWord);
          } else {
            filteredWords.push(nextWord);
          }
        })
      )
    );
    !isProduction &&
      Debugger.reportFiltration(filteredWords, possibleTagNumbers);
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
    const validationStats: ValidationStats[] = [];

    tagValidationResults.forEach((validationResult) => {
      if (!this._attemptId)
        throw new Error('A pseudoranom log entry ID has not been established.');
      // Log the successfull OCR.
      if (validationResult.status === 'fulfilled') {
        const partialLogEntry: OCRPayload = {
          id: this._attemptId,
          isSuccess: true,
          readText: validationResult.value.testValue,
          validatedText: validationResult.value.validatedTagSummary.tagNo
        };
        logScanningAttempt.call(this._tagScannerRef, partialLogEntry);

        // Record the fetched tag summary for use later in presentation.
        validatedTags.push(validationResult.value.validatedTagSummary);
        validationStats.push({
          isSuccess: true,
          testValue: validationResult.value.testValue,
          correction: validationResult.value.validatedTagSummary.tagNo
        });
      } else if (validationResult.status === 'rejected') {
        if ((validationResult.reason as FailedTagValidation).EchoSearchError) {
          // TODO: Handle or log Echo search errors here
        } else {
          // Log the failed OCR.
          const failedPartialLogEntry: OCRPayload = {
            id: this._attemptId,
            isSuccess: false,
            validatedText: undefined,
            readText: (validationResult.reason as FailedTagValidation).testValue
          };
          logScanningAttempt.call(this._tagScannerRef, failedPartialLogEntry);
          validationStats.push({
            isSuccess: false,
            testValue: failedPartialLogEntry.readText
          });
        }
      }
    });

    !isProduction && Debugger.reportValidation(validationStats);
    return validatedTags;

    /**
     * Accepts a possible tag number as string value and runs it through Echo Search for validation.
     */
    async function findClosestTag(possibleTagNumber: string) {
      const result = await Search.Tags.closestTagAsync(possibleTagNumber);
      if (result.isSuccess) {
        logger.log('QA', () => {
          console.info(possibleTagNumber + ' corrected to ' + result.value);
        });
        return result.value;
      } else {
        logger.log('QA', () => {
          console.info(
            'Echo Search could not establish a close match to ' +
              possibleTagNumber
          );
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
              .then((tagSummary) =>
                resolve({
                  validatedTagSummary: tagSummary,
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
