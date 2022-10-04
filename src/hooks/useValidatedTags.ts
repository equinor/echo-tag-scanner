import { TagSummaryDto } from '@equinor/echo-search';
import { useEchoIsSyncing } from '@hooks';
import { useState } from 'react';
import { TagScanner } from '@cameraLogic';
import { useTagScanStatus } from '@services';
import { getNotificationDispatcher as dispatchNotification } from '@utils';

export function useValidatedTags(tagScanner?: TagScanner) {
  const [validatedTags, setValidatedTags] = useState<
    TagSummaryDto[] | undefined
  >(undefined);
  const echoIsSyncing = useEchoIsSyncing();
  const { tagScanStatus, changeTagScanStatus } = useTagScanStatus();

  // Accepts a list of validated tags and sets them in memory for presentation.
  function presentValidatedTags(tags: TagSummaryDto[]) {
    if (Array.isArray(tags) && tags.length > 0) {
      // We got more than 1 validated tag. Set them into state and rerender to present search results.
      setValidatedTags(tags);
    } else {
      // We got no validated tags.
      handleNoTagsFound();
      changeTagScanStatus('noTagsFound', true);
    }
  }

  function handleNoTagsFound() {
    tagScanner?.resumeViewfinder();
    setValidatedTags([]);
  }

  function resetValidatedTags() {
    setValidatedTags(undefined);
  }

  const onTagScan = async () => {
    // Prevent scanning if Echo is syncing, otherwise the validation will not work.
    if (echoIsSyncing) {
      dispatchNotification({
        message: 'Scanning is available as soon as the tag syncing is done.',
        autohideDuration: 2000
      })();
      return;
    }

    // Initial preperations
    setValidatedTags(undefined);
    changeTagScanStatus('scanning', true);

    // Capture image.
    let scans = await tagScanner?.scan();

    if (scans) {
      // Run OCR and validation to get possible tag numbers.
      const validatedTags = await tagScanner?.ocr(scans);

      // Put the validated tags in state.
      changeTagScanStatus('scanning', false);

      if (Array.isArray(validatedTags) && validatedTags?.length === 0) {
        dispatchNotification({
          message: 'No tags detected.',
          autohideDuration: 2000
        })();
      } else {
        if (validatedTags) {
          // Put the validated tags in state.
          presentValidatedTags(validatedTags);
        }
      }
    }
  };

  return { onTagScan, validatedTags, tagScanStatus, resetValidatedTags };
}
