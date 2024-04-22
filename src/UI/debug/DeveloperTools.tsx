import React from 'react';
import { CapturePreview, DebugInfoOverlay, SystemInfoTrigger } from '@ui';
import { Debugger, TagScanner } from '@cameraLogic';

interface DeveloperToolsProps {
  tagScanner: TagScanner;
  viewfinder: HTMLVideoElement;
}

export const DeveloperTools = (props: DeveloperToolsProps): JSX.Element => {
  return (
    <>
      <DebugInfoOverlay
        tagScanner={props.tagScanner}
        viewfinder={props.viewfinder}
      />

      <CapturePreview />

      <SystemInfoTrigger
        getContentsForClipboard={() => Debugger.clipboardThis(props.tagScanner)}
      />
    </>
  );
};
