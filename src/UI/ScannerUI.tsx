import React from 'react';
import { NotificationHandler, ControlPad, Dialogues } from '@ui';
import {
  useEchoIsSyncing,
  useMountScanner,
  useSetActiveTagNo,
  useValidatedTags
} from '@hooks';

interface ScannerProps {
  stream: MediaStream;
  viewfinder: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  scanningArea: HTMLElement;
}

/**
 * This component harbors everything a user interacts with.
 */
function Scanner({ stream, viewfinder, canvas, scanningArea }: ScannerProps) {
  const { tagScanner } = useMountScanner(
    viewfinder,
    canvas,
    stream,
    scanningArea
  );
  const { validatedTags, onTagScan, tagScanStatus, resetValidatedTags } =
    useValidatedTags(tagScanner);
  const tagSearch = useSetActiveTagNo();
  const echoIsSyncing = useEchoIsSyncing();

  if (!tagScanner) return null;

  return (
    <>
      <ControlPad
        tagScanner={tagScanner}
        viewfinder={viewfinder}
        echoIsSyncing={echoIsSyncing}
        tagScanStatus={tagScanStatus}
        onTagScan={onTagScan}
      />

      <NotificationHandler />

      <Dialogues
        validatedTags={validatedTags}
        tagScanner={tagScanner}
        tagSearch={tagSearch}
        resetValidatedTags={() => {
          tagScanner?.prepareNewScan().then(resetValidatedTags);
        }}
      />
    </>
  );
}

export { Scanner };
