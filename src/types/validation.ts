import { TagSummaryDto } from '@equinor/echo-search';

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
