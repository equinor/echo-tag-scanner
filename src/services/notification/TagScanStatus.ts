import { useState } from 'react';

type TagScanStatus = {
  uploading: boolean;
  validating: boolean;
  finished: boolean;
  noTagsFound: boolean;
};

export type TagScanningStages =
  | 'finished'
  | 'uploading'
  | 'validating'
  | 'noTagsFound'
  | 'runningOcr';

export interface TagScan {
  tagScanStatus: TagScanStatus;
  changeTagScanStatus: (property: TagScanningStages, value: boolean) => void;
}

export function useTagScanStatus(): TagScan {
  // TODO: Clean up unused statuses.
  const [tagScanStatus, setTagScanStatus] = useState<TagScanStatus>({
    finished: false,
    uploading: false,
    validating: false,
    noTagsFound: false
  });

  const changeTagScanStatus = (property: TagScanningStages, value: boolean) => {
    setTagScanStatus({ ...tagScanStatus, [property]: value });
  };

  return { tagScanStatus, changeTagScanStatus };
}
