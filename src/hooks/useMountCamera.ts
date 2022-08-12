import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import EchoUtils from '@equinor/echo-utils';

import { TagScanner } from '../core/Scanner';
import { CameraProps } from '@types';
import { assignZoomSettings } from '@utils';
import { Search } from '@equinor/echo-search';

type CameraInfrastructure = {
  tagScanner?: TagScanner;
  setZoomInputRef: Dispatch<SetStateAction<HTMLInputElement | undefined>>;
  tagsAreSynced: boolean;
};

async function getTagSyncStatus(): Promise<boolean> {
  const status = await Search.Tags.isInMemoryReadyAsync();
  console.log('is done?', status.value);
  if (status.isSuccess) {
    return Boolean(status.value);
  }
  return false;
}

const { useEffectAsync } = EchoUtils.Hooks;
export function useMountScanner(
  viewfinder: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  stream: MediaStream
): CameraInfrastructure {
  // Zoom controls. Currently only Android.
  const [zoomRef, setZoomInputRef] = useState<HTMLInputElement>();
  const [tagScanner, setCamera] = useState<TagScanner | undefined>(undefined);
  const [tagsAreSynced, setTagsAreSynced] = useState(false);

  useEffectAsync(async (signal) => {
    const props: CameraProps = {
      mediaStream: stream,
      viewfinder,
      canvas
    };

    const camera = new TagScanner(props);

    if (!signal.aborted) {
      setCamera(camera);
      setTagsAreSynced(await getTagSyncStatus());
    }

    return () => {
      camera.stopCamera();
    };
  }, []);

  // Handling zoom assignments
  useEffect(() => {
    if (!tagScanner) return;
    if (zoomRef == null) return;

    // Setup the zoom slider with the min, max and step values.
    zoomRef.min = assignZoomSettings('min', tagScanner);
    zoomRef.max = assignZoomSettings('max', tagScanner);
    zoomRef.step = assignZoomSettings('step', tagScanner);
    zoomRef.value = '1';
  }, [tagScanner, zoomRef]);

  return {
    tagScanner,
    setZoomInputRef,
    tagsAreSynced
  };
}
