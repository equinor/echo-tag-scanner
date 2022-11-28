import React, { useEffect, useState } from 'react';
import {
  CameraResolution,
  ViewfinderDimensions,
  ZoomEventDetail
} from '@types';
import { TagScanner } from '@cameraLogic';
import { zIndexes } from '@const';
import { isCustomResolutionEvent, isCustomZoomEvent } from '@utils';

type DebugInfo = {
  viewfinder: ViewfinderDimensions;
  cameraFeed: CameraResolution;
  viewport: ViewfinderDimensions;
  zoomFactor: string;
  frameRate: string;
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
    },
    zoomFactor: '1',
    frameRate: String(props.tagScanner.videoTrackSettings?.frameRate) ?? 'n/a'
  });

  useEffect(function updateDebugInfo() {
    globalThis.addEventListener('camera-zoom', (event) => {
      if (isCustomZoomEvent(event)) {
        setDebugInfo(
          getFreshDebugInfo({ zoomFactor: event.detail.zoomFactor })
        );
      }
    });

    globalThis.addEventListener('camera-resolution', (event) => {
      if (isCustomResolutionEvent(event)) {
        setDebugInfo(
          getFreshDebugInfo({
            width: event.detail.width,
            height: event.detail.height,
            zoomFactor: event.detail.zoomFactor
          })
        );
      }
    });
  }, []);

  function getFreshDebugInfo(
    info?: Partial<ZoomEventDetail> | Partial<CameraResolution>
  ): DebugInfo {
    const debugInfo = {
      viewfinder: {
        width: props.viewfinder.width,
        height: props.viewfinder.height
      },
      cameraFeed: {
        width:
          (info && Reflect.get(info, 'width')) ||
          props.tagScanner?.videoTrackSettings?.width,
        height:
          (info && Reflect.get(info, 'height')) ||
          props.tagScanner?.videoTrackSettings?.height
      },
      viewport: {
        width: globalThis.visualViewport?.width,
        height: globalThis.visualViewport?.height
      },
      zoomFactor: String(info?.zoomFactor),
      frameRate: '60'
    };

    if (info && 'fps' in info) {
      debugInfo.frameRate = String(info?.fps || 'n/a');
    }
    return debugInfo;
  }

  return (
    <output
      style={{
        position: 'fixed',
        top: '0',
        right: '0',
        zIndex: zIndexes.overlays
      }}
    >
      {debugInfo.cameraFeed && (
        <mark style={{ backgroundColor: 'hotpink' }}>
          Camera feed: {debugInfo.cameraFeed.width}x
          {debugInfo.cameraFeed.height}@{debugInfo.frameRate}fps
        </mark>
      )}
      <br />
      <mark style={{ backgroundColor: 'lightblue' }}>
        Viewport: {debugInfo.viewport?.width}x{debugInfo.viewport?.height}
      </mark>
      <br />
      <mark style={{ backgroundColor: 'lightgreen' }}>
        Zoom: {debugInfo.zoomFactor}x
      </mark>
    </output>
  );
};
