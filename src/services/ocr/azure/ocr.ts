import { ParsedComputerVisionResponse, TextItem } from '@types';
import {
  isProduction,
  uniqueStringArray,
  reassembleSpecialTagCandidates,
  reassembleOrdinaryTagCandidates,
  combineUrls
} from '@utils';
import { Debugger } from '../../../cameraLogic/debugger';
import { EchoEnv } from '@equinor/echo-core';

import { AzureOCR } from './AzureOCR';

type AzureOCRv2Response = {
  language: string;
  textAngle: number;
  orientation: 'Up' | 'Down' | 'Left' | 'Right';
  regions: Region[];
  modelVersion: string;
};

/**
 * example: "462,379,497,258"
 */
type BoundingBox = string;

type Region = {
  boundingBox?: BoundingBox;
  lines: Lines[];
};

type Lines = {
  boundingBox?: BoundingBox;
  words: Word[];
};

type Word = {
  boundingBox?: BoundingBox;
  text: string;
};

export class AzureOCRv2 extends AzureOCR<AzureOCRv2Response> {
  protected handlePostOCR(response: AzureOCRv2Response) {
    this.resetTagCandidates();
    let clonedResponse = structuredClone<AzureOCRv2Response>(response);

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
        specialCases.push(
          ...reassembleSpecialTagCandidates(allWordsOnLine, '(C)')
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

    return this.parseResponse(clonedResponse);
  }

  protected parseResponse(
    response: AzureOCRv2Response
  ): ParsedComputerVisionResponse {
    const parsedResponse: ParsedComputerVisionResponse = [];
    response.regions.forEach((region) =>
      region.lines.forEach((line) => {
        const uniqueWords = uniqueStringArray(
          line.words.map((word) => word.text)
        );

        uniqueWords.forEach((word) => {
          const textItem: TextItem = {
            text: word
          };

          parsedResponse.push(textItem);
        });
      })
    );

    return parsedResponse;
  }

  protected getComputerVisionOcrResources(
    capture: Blob
  ): [url: string, body: BodyInit, requestInit: RequestInit] {
    let url = combineUrls(
      EchoEnv.env().REACT_APP_API_URL,
      'tag-scanner',
      'scan-image'
    );
    const requestInit: RequestInit = {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    };

    return [url, capture, requestInit];
  }
}
