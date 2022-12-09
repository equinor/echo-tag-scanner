import { TagSummaryDto } from '@equinor/echo-search';

export type TagValidationResult = {
  validatedTagSummary: TagSummaryDto;
  testValue: string;
};

export type FailedTagValidation = {
  EchoSearchError?: unknown;
  testValue: string;
};

export type ValidationStats = {
  testValue: string;
  correction?: string;
  isSuccess: boolean;
};
