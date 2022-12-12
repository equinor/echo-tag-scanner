import { TagSummaryDto } from '@equinor/echo-search';

export type TagScanStatus = {
  uploading: boolean;
  validating: boolean;
  finished: boolean;
  noTagsFound: boolean;

  // This might replace most of the statuses above.
  scanning: boolean;
};

export type TagScanningStages =
  | 'finished'
  | 'uploading'
  | 'validating'
  | 'noTagsFound'
  | 'runningOcr'
  | 'scanning';

export interface TagScan {
  tagScanStatus: TagScanStatus;
  changeTagScanStatus: (property: TagScanningStages, value: boolean) => void;
}

export interface ValidatedTagsHandling {
  onTagScan: () => Awaited<Promise<void>>;
  resetValidatedTags: () => void;
  validatedTags?: TagSummaryDto[];
  tagScanStatus: TagScanStatus;
}
