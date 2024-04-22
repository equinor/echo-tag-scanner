import { randomBytes } from 'crypto';

import { TagSummaryDto } from '@equinor/echo-search';
import { BackendError } from '@equinor/echo-base';

import {
  MockWord,
  OCRPayload,
  OCRService,
  ParsedComputerVisionResponse,
  TextItem
} from '@types';
import {
  Timer,
  handleError,
  isProduction,
  logger,
  ocrFilterer,
  reassembleOrdinaryTagCandidates,
  reassembleSpecialTagCandidates
} from '@utils';
import { ErrorRegistry, homoglyphPairs } from '@const';
import { Debugger } from '@cameraLogic';

import { baseApiClient } from '../../api/base/base';
import { AzureOCRValidator } from './validator';

export abstract class AzureOCR<Response> implements OCRService {
  private _attemptId?: string;
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
        this._attemptId = newId;
        resolve(newId);
      });
    });
  }

  protected _tagCandidates: TextItem[] = [];
  protected _validator: AzureOCRValidator;

  constructor(validator: AzureOCRValidator = new AzureOCRValidator()) {
    this._attemptId = undefined;

    this._validator = validator;
    // Add testPostOcr function as callable from console for debugging purposes
    globalThis.testPostOCR = this.testPostOCR.bind(this);
  }

  public handleValidation(
    unvalidatedTags: ParsedComputerVisionResponse
  ): Promise<{
    validatedTags: TagSummaryDto[];
    validationLogEntry?: OCRPayload | undefined;
  }> {
    return this._validator.handleValidation(this.attemptId, unvalidatedTags);
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
      if (this.wordIsSpecialCase(allWordsOnLine[i].text)) {
        this.sanitize(allWordsOnLine[i].text, '()');
      } else {
        allWordsOnLine[i].text = this.sanitize(allWordsOnLine[i].text);
        allWordsOnLine[i] = this.handleHomoglyphing(allWordsOnLine[i]);
      }
    }
    this.resetTagCandidates();

    const specialCases = reassembleSpecialTagCandidates(allWordsOnLine, '(M)');
    specialCases.push(...reassembleSpecialTagCandidates(allWordsOnLine, '(C)'));

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

  public async runOCR(scan: Blob): Promise<{
    ocrResponse: ParsedComputerVisionResponse;
    networkRequestTimeTaken: number;
    postOCRTimeTaken: number;
  } | null> {
    try {
      const networkRequestTimer = new Timer();
      networkRequestTimer.start();
      const data = await this.postOCRRequest(scan);
      const networkRequestTimeTaken = networkRequestTimer.stop();

      const postOCRTimer = new Timer();
      postOCRTimer.start();
      const postProcessedResponse = this.handlePostOCR(data);
      const postOCRTimeTaken = postOCRTimer.stop();

      return {
        ocrResponse: postProcessedResponse,
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
  }

  protected async postOCRRequest(scan: Blob): Promise<Response> {
    const [url, body, init] = this.getComputerVisionOcrResources(scan);
    try {
      const response = await baseApiClient.postAsync<Response>(url, body, init);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // #region Abstracts
  /**
   * Parses the received OCR response into the expected ParsedComputerViwionResponse type.
   */
  protected abstract handlePostOCR(
    response: Response
  ): ParsedComputerVisionResponse;
  /**
   * Handles creating the Body and request headers relating to sending an image to ocr services.
   */
  protected abstract getComputerVisionOcrResources(
    capture: Blob
  ): [url: string, body: BodyInit, requestInit: RequestInit];

  // #endregion

  // #region OCR Utils
  protected resetTagCandidates() {
    this._tagCandidates = [];
  }

  /** Returns true if the supplied word is a possible special case tag number. */
  protected wordIsSpecialCase(word: string) {
    return ocrFilterer.isMotorTag(word);
    // TODO: Handle "C-tags" and Line tags.
  }
  /**
   * Accepts a string, trims whitespace, and removes trailing and leading alphanumeric characters before returning it.
   */
  protected sanitize(word: string, exceptions?: string) {
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
  protected handleHomoglyphing(word: TextItem): TextItem {
    let original = word.text;
    let alteredOriginal: string | undefined = undefined;
    let lineTagIdentifier = '';

    if (ocrFilterer.isLineTag(original)) {
      const i = word.text.indexOf('"');
      lineTagIdentifier = word.text.substring(0, i);
      alteredOriginal = word.text.substring(i);
    }

    word.text = Array.from(alteredOriginal ?? original)
      .map((char) => getHomoglyphSubstitute(char))
      .join('');
    word.text = lineTagIdentifier + word.text;
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
  // #endregion
}
