import { EchoEnv } from '@equinor/echo-core';

import { ParsedComputerVisionResponse, TextItem } from '@types';
import {
  combineUrls,
  isProduction,
  reassembleOrdinaryTagCandidates,
  reassembleSpecialTagCandidates
} from '@utils';
import { Debugger } from '@cameraLogic';

import { AzureOCR } from './AzureOCR';

export type AzureOCRv4Response = {
  hasCompleted: boolean;
  hasValue: boolean;
  id: string;
  value: {
    modelId: string; // prebuilt-read;
    serviceVersion: string;
    content: string; // this is usually all text found in the image reconstructed;
    pages: Page[];
  };
};

type Page = {
  angle: number;
  barcodes: [];
  formulas: [];
  height: number;
  width: number;
  pageNumber: number;
  selectionMarks: [];
  lines: Line[];
  words: Word[];
};

type Line = {
  boundingPolygon: BoundingBox[];
  content: string;
};

type Word = {
  boundingPolygon: BoundingBox[];
  confidence: number; // between 0-1;
  content: string;
};

type BoundingBox = { isEmpty: boolean; x: number; y: number };

export class AzureOCRv4 extends AzureOCR<AzureOCRv4Response> {
  protected handlePostOCR(response: AzureOCRv4Response) {
    this.resetTagCandidates();
    let clonedResponse = structuredClone<AzureOCRv4Response>(response);

    clonedResponse.value.pages.forEach((page, pageIndex) => {
      const allWordsOnLine = page.words;
      for (let i = 0; i < allWordsOnLine.length; i++) {
        if (this.wordIsSpecialCase(allWordsOnLine[i].content)) {
          allWordsOnLine[i].content = this.sanitize(
            allWordsOnLine[i].content,
            '()'
          );
        } else {
          allWordsOnLine[i].content = this.sanitize(allWordsOnLine[i].content);

          const homoHandledWord = this.handleHomoglyphing({
            text: allWordsOnLine[i].content
          });
          allWordsOnLine[i] = {
            ...allWordsOnLine[i],
            content: homoHandledWord.text
          };
        }
      }

      const tagCandidates: Array<Word & { text: string }> = [
        ...reassembleSpecialTagCandidates<Word & { text: string }>(
          allWordsOnLine.map((word) => ({ text: word.content, ...word })),
          '(M)'
        ),
        ...reassembleSpecialTagCandidates<Word & { text: string }>(
          allWordsOnLine.map((word) => ({ text: word.content, ...word })),
          '(C)'
        ),
        ...reassembleOrdinaryTagCandidates<Word & { text: string }>(
          allWordsOnLine.map((word) => ({ text: word.content, ...word }))
        )
      ];

      const words: Word[] = tagCandidates.map((candidate) => {
        const { text, ...relevantCandidate } = candidate;

        const word: Word = {
          ...relevantCandidate,
          content: text
        };

        return word;
      });
      clonedResponse.value.pages[pageIndex].words = words;
    });

    !isProduction &&
      Debugger.reportFiltration(
        this._tagCandidates.map((candidate) => candidate.text)
      );

    return this.parseResponse(clonedResponse);
  }

  protected parseResponse(
    response: AzureOCRv4Response
  ): ParsedComputerVisionResponse {
    const parsedResponse: ParsedComputerVisionResponse = [];
    response.value.pages.forEach((page) =>
      page.words.forEach((word) => {
        const textItem: TextItem = {
          text: word.content
        };

        if (word.confidence > 0.7) {
          parsedResponse.push(textItem);
        }
      })
    );

    return parsedResponse;
  }

  protected getComputerVisionOcrResources(
    capture: Blob
  ): [url: string, body: BodyInit, requestInit: RequestInit] {
    let url = combineUrls(
      EchoEnv.env().REACT_APP_API_URL,
      'pdf-scanner',
      'scan-image'
    );

    const formData = new FormData();
    formData.append('iFormFile', capture);

    const requestInit: RequestInit = {};

    return [url, formData, requestInit];
  }
}
