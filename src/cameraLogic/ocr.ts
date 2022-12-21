import { BackendError } from '@equinor/echo-base';
import {
  ComputerVisionResponse,
  FailedTagValidation,
  Lines,
  MockWord,
  OCRPayload,
  ParsedComputerVisionResponse,
  TagValidationResult,
  ValidationStats,
  Word
} from '@types';
import {
  handleError,
  logger,
  ocrFilterer,
  logScanningAttempt,
  isProduction
} from '@utils';
import { ErrorRegistry, homoglyphPairs } from '@const';
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
  private _tagCandidates: Word[] = [];
  private _tagNoncandidates: Word[] = [];

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

      const postProcessedResponse = this.handlePostOCR(response.data);
      return parseResponse(postProcessedResponse);

      /**
       * Maps each postprocessed Word's text property into a simple array of strings.
       */
      function parseResponse(
        response: ComputerVisionResponse
      ): ParsedComputerVisionResponse {
        const stringifiedWords: ParsedComputerVisionResponse = [];
        response.regions.forEach((region) =>
          region.lines.forEach((line) =>
            line.words.forEach((word) => stringifiedWords.push(word.text))
          )
        );

        return stringifiedWords;
      }
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

  private handlePostOCR(response: ComputerVisionResponse) {
    this.resetTagCandidates();
    response.regions.forEach((region) =>
      region.lines.forEach((line) => {
        // Does the line contain a special case candidate?
        const isSpecialCase = line.words.some((word) =>
          this.wordIsSpecialCase(word.text)
        );

        if (isSpecialCase) {
          line.words = this.handleSpecialTagCandidates(line.words);
        } else {
          line.words = this.handleOrdinaryTagCandidates(line.words);
        }

        !isProduction &&
          Debugger.reportFiltration(
            this._tagNoncandidates.map((candidate) => candidate.text),
            this._tagCandidates.map((candidate) => candidate.text)
          );
      })
    );

    return response;
  }

  public testPostOCR(words: MockWord[]) {
    if (!argumentIsMockWords(words)) {
      console.info('The data should have the following format: ');
      console.info(
        '[{text: "tag number candiate"}, {text: "another tag number candidate"}]'
      );
      return;
    }
    this.resetTagCandidates();

    const specialCases = words.filter((word) =>
      this.wordIsSpecialCase(word.text)
    );

    const ordinaryCases = words.filter(
      (word) => !this.wordIsSpecialCase(word.text)
    );

    if (specialCases.length > 0) this.handleSpecialTagCandidates(specialCases);
    if (ordinaryCases.length > 0)
      this.handleOrdinaryTagCandidates(ordinaryCases);

    !isProduction &&
      Debugger.reportFiltration(
        this._tagNoncandidates.map((candidate) => candidate.text),
        this._tagCandidates.map((candidate) => candidate.text)
      );

    function argumentIsMockWords(argument: unknown): argument is MockWord[] {
      if (Array.isArray(argument)) {
        return argument.every((arg) => Reflect.has(arg, 'text'));
      }

      return false;
    }
  }

  private handleSpecialTagCandidates(words: Word[]): Word[] {
    for (let i = 0; i < words.length; i++) {
      words[i].text = this.sanitize(words[i].text, true);
    }

    if (words.length > 1) {
      // TODO: Handle reassembly.
    }

    this._tagCandidates.push(...words);
    return words;
  }

  /**
   * Handles the filtering of ordinary tag candidates.
   */
  private handleOrdinaryTagCandidates(words: Word[]) {
    for (let i = 0; i < words.length; i++) {
      words[i].text = this.sanitize(words[i].text);
      words[i] = this.handleHomoglyphing(words[i]);
    }

    if (words.length > 1) {
      // TODO: Handle reassembly.
    }

    words.forEach((word: Word) => {
      if (
        ocrFilterer.hasEnoughCharacters(word.text) &&
        ocrFilterer.lettersAreValid(word.text) &&
        ocrFilterer.hasTwoIntegers(word.text)
      ) {
        this._tagCandidates.push(word);
      } else this._tagNoncandidates.push(word);
    });

    return this._tagCandidates;
  }

  private resetTagCandidates() {
    this._tagCandidates = [];
    this._tagNoncandidates = [];
  }

  /** Returns true if the supplied word is a possible special case tag number. */
  private wordIsSpecialCase(word: string) {
    return ocrFilterer.isMotorTag(word);
    // TODO: Handle "C-tags" and Line tags.
  }
  /**
   * Accepts a string, trims whitespace, and removes trailing and leading alphanumeric characters before returning it.
   */
  private sanitize(word: string, specialCase?: boolean) {
    word = word.trim();
    word = word.toUpperCase();
    if (!specialCase) {
      word = ocrFilterer.filterTrailingAndLeadingChars(word);
    }
    return word;
  }

  /** Handles the homoglyphing substitution on the word level. */
  private handleHomoglyphing(word: Word): Word {
    const rawWord = word.text;
    word.text = Array.from(rawWord)
      .map((char) => getHomoglyphSubstitute(char))
      .join('');

    return word;

    /**
     * Accepts a character and returns a homoglyph substitution if it exists. Otherwise, it returns the original character.
     */
    function getHomoglyphSubstitute(char: string): string {
      const foundHomoglyphIndex = homoglyphPairs.findIndex(
        (pair) => pair.homoglyph === char
      );

      if (foundHomoglyphIndex !== -1)
        return homoglyphPairs[foundHomoglyphIndex].substitution;
      return char;
    }
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

