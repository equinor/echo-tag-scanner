import React, { useEffect, useState } from 'react';
import { CameraResolution, ViewfinderDimensions } from '@types';
import { TagScanner } from '../../cameraLogic';

type DebugInfo = {
  viewfinder: ViewfinderDimensions;
  cameraFeed: CameraResolution;
  viewport: ViewfinderDimensions;
};

interface DebugInfoOverlayProps {
  viewfinder: HTMLVideoElement;
  tagScanner: TagScanner;
}

export const DebugInfoOverlay = (props: DebugInfoOverlayProps): JSX.Element => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    viewfinder: {
      width: props.viewfinder.width,
      height: props.viewfinder.height
    },
    cameraFeed: {
      width: props.tagScanner?.videoTrackSettings?.width,
      height: props.tagScanner?.videoTrackSettings?.height
    },
    viewport: {
      width: globalThis.visualViewport?.width,
      height: globalThis.visualViewport?.height
    }
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    function getFreshDebugInfo() {
      return {
        viewfinder: {
          width: props.viewfinder.width,
          height: props.viewfinder.height
        },
        cameraFeed: {
          width: props.tagScanner?.videoTrackSettings?.width,
          height: props.tagScanner?.videoTrackSettings?.height
        },
        viewport: {
          width: globalThis.visualViewport?.width,
          height: globalThis.visualViewport?.height
        }
      };
    }
    setDebugInfo(getFreshDebugInfo());
  }, [
    props.viewfinder.width,
    props.viewfinder.height,
    props.tagScanner?.videoTrackSettings?.width,
    props.tagScanner?.videoTrackSettings?.height
  ]);

  if (props.viewfinder instanceof HTMLVideoElement) {
    props.viewfinder.addEventListener('loadeddata', () => {
      setDebugInfo(getFreshDebugInfo());
    });
  }

  function getFreshDebugInfo() {
    return {
      viewfinder: {
        width: props.viewfinder.width,
        height: props.viewfinder.height
      },
      cameraFeed: {
        width: props.tagScanner?.videoTrackSettings?.width,
        height: props.tagScanner?.videoTrackSettings?.height
      },
      viewport: {
        width: globalThis.visualViewport?.width,
        height: globalThis.visualViewport?.height
      }
    };
  }

  return (
    <output
      style={{ position: 'absolute', top: '20%', left: '20%', zIndex: 10 }}
    >
      {debugInfo.cameraFeed && (
        <mark style={{ backgroundColor: 'hotpink' }}>
          Camera feed: {debugInfo.cameraFeed.width}x
          {debugInfo.cameraFeed.height}
        </mark>
      )}
      <br />
      <mark style={{ backgroundColor: 'lightblue' }}>
        Viewport: {debugInfo.viewport?.width}x{debugInfo.viewport?.height}
      </mark>
      <br />
      {props.viewfinder && (
        <mark style={{ backgroundColor: 'green' }}>
          Viewfinder: {debugInfo.viewfinder.width}x{debugInfo.viewfinder.height}
        </mark>
      )}
    </output>
  );
};
