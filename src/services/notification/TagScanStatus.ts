import { useState } from 'react';
import { TagScan, TagScanningStages, TagScanStatus } from '@types';

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
