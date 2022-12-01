import { useState } from 'react';

type TagScanStatus = {
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

export function useTagScanStatus(): TagScan {
  const [tagScanStatus, setTagScanStatus] = useState<TagScanStatus>({
    finished: false,
    uploading: false,
    validating: false,
    noTagsFound: false,
    scanning: false
  });

  const changeTagScanStatus = (property: TagScanningStages, value: boolean) => {
    setTagScanStatus({ ...tagScanStatus, [property]: value });
  };

  return { tagScanStatus, changeTagScanStatus };
}
