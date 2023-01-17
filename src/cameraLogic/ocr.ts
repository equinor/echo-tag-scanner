import { BackendError } from '@equinor/echo-base';
import {
  ComputerVisionResponse,
  FailedTagValidation,
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
  isProduction,
  uniqueStringArray,
  reassembleSpecialTagCandidates,
  reassembleOrdinaryTagCandidates,
  filterBy,
  Timer,
  objectClone
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

  constructor(props: OCRProps) {
    this._attemptId = undefined;
    this._tagScannerRef = props.tagScanner;
  }

  /** Generates a pseudorandom sequence of 16 bytes and returns them hex encoded. */
  public get attemptId(): string {
    if (!this._attemptId)
      throw new ReferenceError(
        'Attempted to access generated scanId, but it was undefined.'
      );
    return this._attemptId;
  }

  public refreshAttemptId(): Promise<string> {
    return new Promise((resolve, reject) => {
      randomBytes(16, (hashError, bufferContents) => {
        if (hashError) {
          reject('The random ID generation failed.');
          logger.log('Prod', () => console.error(hashError));

          // Error is thrown here for now to spare the one call site from using an ugly try catch block
          throw new Error(hashError.message);
        }

        const newId = bufferContents.toString('hex');
        console.log('%c⧭', 'color: #994d75', newId);
        this._attemptId = newId;
        resolve(newId);
      });
    });
  }

  public async runOCR(scan: Blob): Promise<{
    ocrResponse: ParsedComputerVisionResponse;
    networkRequestTimeTaken: number;
    postOCRTimeTaken: number;
  } | null> {
    const [url, body, init] = getComputerVisionOcrResources(scan);
    try {
      const networkRequestTimer = new Timer();
      networkRequestTimer.start();
      const response = await baseApiClient.postAsync<ComputerVisionResponse>(
        url,
        body,
        init
      );
      const networkRequestTimeTaken = networkRequestTimer.stop();

      const postOCRTimer = new Timer();
      postOCRTimer.start();
      const postProcessedResponse = this.handlePostOCR(response.data);
      const postOCRTimeTaken = postOCRTimer.stop();

      return {
        ocrResponse: parseResponse(postProcessedResponse),
        networkRequestTimeTaken: networkRequestTimeTaken,
        postOCRTimeTaken: postOCRTimeTaken
      };
    } catch (error) {
      if (error instanceof BackendError && error.httpStatusCode === 429) {
        // Here we handle the event where users might go over the Computer vision usage quota.
        // We do not percieve this as an error on the client side. The user will simply try again.
        logger.log('EchoDevelopment', () =>
          console.warn(
            'The scan operation resulted in an overload in the usage quota for Computer Vision. This is normally not a problem and we simply return empty results to the users. This will prompt them to try again.'
          )
        );
        return null;
      } else {
        logger.log('QA', () => console.error('API Error -> ', error));
        throw handleError(ErrorRegistry.ocrError, error as Error);
      }
    }

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

      return uniqueStringArray(stringifiedWords);
    }
  }

  private handlePostOCR(response: ComputerVisionResponse) {
    this.resetTagCandidates();
    let clonedResponse = objectClone<ComputerVisionResponse>(response);

    clonedResponse.regions.forEach((region, regionIndex) =>
      region.lines.forEach((line, lineIndex) => {
        const allWordsOnLine = line.words;
        for (let i = 0; i < allWordsOnLine.length; i++) {
          if (this.wordIsSpecialCase(allWordsOnLine[i].text)) {
            allWordsOnLine[i].text = this.sanitize(
              allWordsOnLine[i].text,
              '()'
            );
          } else {
            allWordsOnLine[i].text = this.sanitize(allWordsOnLine[i].text);
            allWordsOnLine[i] = this.handleHomoglyphing(allWordsOnLine[i]);
          }
        }

        const specialCases = reassembleSpecialTagCandidates(
          allWordsOnLine,
          '(M)'
        );
        const ordinaryCases = reassembleOrdinaryTagCandidates(allWordsOnLine);
        this._tagCandidates.push(...specialCases);
        this._tagCandidates.push(...ordinaryCases);

        clonedResponse.regions[regionIndex].lines[lineIndex].words =
          this._tagCandidates;
      })
    );

    !isProduction &&
      Debugger.reportFiltration(
        this._tagCandidates.map((candidate) => candidate.text)
      );
    return clonedResponse;
  }

  public testPostOCR(allWordsOnLine: MockWord[]) {
    if (!argumentIsMockWords(allWordsOnLine)) {
      console.info('The data should have the following format: ');
      console.info(
        '[{text: "tag number candiate"}, {text: "another tag number candidate"}]'
      );
      return;
    }

    for (let i = 0; i < allWordsOnLine.length; i++) {
      if (allWordsOnLine[i].text.includes('(M)')) {
        this.sanitize(allWordsOnLine[i].text, '()');
      } else {
        allWordsOnLine[i].text = this.sanitize(allWordsOnLine[i].text);
        allWordsOnLine[i] = this.handleHomoglyphing(allWordsOnLine[i]);
      }
    }
    this.resetTagCandidates();

    const specialCases = reassembleSpecialTagCandidates(allWordsOnLine, '(M)');
    const ordinaryCases = reassembleOrdinaryTagCandidates(allWordsOnLine);
    this._tagCandidates = [...specialCases, ...ordinaryCases];

    !isProduction &&
      Debugger.reportFiltration(
        this._tagCandidates.map((candidate) => candidate.text)
      );

    function argumentIsMockWords(argument: unknown): argument is MockWord[] {
      if (Array.isArray(argument)) {
        return argument.every((arg) => Reflect.has(arg, 'text'));
      }

      return false;
    }
  }

  private resetTagCandidates() {
    this._tagCandidates = [];
  }

  /** Returns true if the supplied word is a possible special case tag number. */
  private wordIsSpecialCase(word: string) {
    return ocrFilterer.isMotorTag(word);
    // TODO: Handle "C-tags" and Line tags.
  }
  /**
   * Accepts a string, trims whitespace, and removes trailing and leading alphanumeric characters before returning it.
   */
  private sanitize(word: string, exceptions?: string) {
    word = word.trim();
    word = Array.from(word)
      .map((char) => {
        if (char.match(/[a-z0-9]/g)) return char.toUpperCase();
        else return char;
      })
      .join('');
    word = ocrFilterer.filterTrailingAndLeadingChars(word, exceptions);
    return word;
  }

  /** Handles the homoglyphing substitution on the word level. */
  private handleHomoglyphing(word: Word): Word {
    const original = word.text;
    word.text = Array.from(original)
      .map((char) => getHomoglyphSubstitute(char))
      .join('');
    const altered = word.text;

    if (original !== word.text) {
      Debugger.reportHomoglypSubstitution(original, altered);
    }

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
  ): Promise<{
    validatedTags: TagSummaryDto[];
    validationLogEntry?: OCRPayload;
  }> {
    const tagValidationTasks = unvalidatedTags.map((funcLocation) =>
      createTagValidator(funcLocation)
    );
    const tagValidationResults = await Promise.allSettled([
      ...tagValidationTasks
    ]);
    const validatedTags: TagSummaryDto[] = [];
    const validationStats: ValidationStats[] = [];
    let logEntry: OCRPayload | undefined;

    tagValidationResults.forEach((validationResult) => {
      if (!this._attemptId)
        throw new Error('A pseudoranom log entry ID has not been established.');
      // Log the successfull OCR.
      if (validationResult.status === 'fulfilled') {
        logEntry = {
          id: this._attemptId,
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
            id: this._attemptId,
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

    /**
     * Accepts a possible tag number as string value and runs it through Echo Search for validation.
     */
    async function findClosestTag(possibleTagNumber: string) {
      const result = await Search.Tags.closestTagAsync(possibleTagNumber);
      if (result.isSuccess) {
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
     * @fulfill {TagValidationResult} The {TagSummaryDto} and the test value.
     * @reject {FailedValidation} The test value
     */
    async function createTagValidator(
      testValue: string
    ): Promise<TagValidationResult> {
      return new Promise((resolve, reject) => {
        const validationTimer = new Timer();
        validationTimer.start();
        findClosestTag(testValue).then((closestTagMatch) => {
          if (closestTagMatch) {
            getTagSummary(closestTagMatch)
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
}
