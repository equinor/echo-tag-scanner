import { EchoEnv } from '@equinor/echo-core';

import { combineUrls } from '@utils';

import { AzureOCRv2 } from './ocr';

/**
 * DONE:
 * - Change resources to new endpoint /pdf-scanner/scan-image
 *
 * TODO
 * - Change response handling into handling the new response type?.
 * - More?
 */

export class AzureOCRv4 extends AzureOCRv2 {
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
