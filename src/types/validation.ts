import { TagSummaryDto } from '@equinor/echo-search';

import { ParsedComputerVisionResponse } from './computerVision';
import { OCRPayload } from './logging';

export type TagValidationResult = {
  validatedTagSummary: TagSummaryDto;
  testValue: string;
  timeTaken: number;
};

export type FailedTagValidation = {
  EchoSearchError?: unknown;
  testValue: string;
  timeTaken: number;
};

export type ValidationStats = {
  testValue: string;
  correction?: string;
  isSuccess: boolean;
};

export interface OCRValidator {
  handleValidation(
    attemptId: string,
    unvalidatedTags: ParsedComputerVisionResponse
  ): Promise<{
    validatedTags: TagSummaryDto[];
    validationLogEntry?: OCRPayload;
  }>;
}
