import React, { useRef, useState } from 'react';
import { Camera } from '@cameraLogic';
import styled from 'styled-components';
import { Button } from '@equinor/eds-core-react';
import { zIndexes } from '@const';
import EchoUtils from '@equinor/echo-utils';

interface CapturePreviewProps {
  camera: Camera;
}

type PreviewDimensions = {
  width: number;
  height: number;
};

type Preview = {
  url: string;
  dimensions?: PreviewDimensions;
  size: number;
};

export const CapturePreview = (
  props: CapturePreviewProps
): JSX.Element | null => {
  const [preview, setPreview] = useState<Preview | undefined>(undefined);
  const imageElement = useRef<HTMLImageElement | null>(null);

  EchoUtils.Hooks.useEffectAsync(async () => {
    globalThis.addEventListener(
      'ets-capture',
      async (e) => await updateImageUrlFromEvent(e)
    );

    async function updateImageUrlFromEvent(event: Event) {
      const previewDimensions: PreviewDimensions =
        await getPreviewImageDimensions(
          //@ts-ignore
          event.detail.url
        );

      setPreview({
        //@ts-ignore
        url: event.detail.url,
        //@ts-ignore
        size: event.detail.size,
        dimensions: previewDimensions
      });
    }
    return globalThis.removeEventListener(
      'ets-capture',
      updateImageUrlFromEvent
    );
  }, []);

  // We ignore this in order to avoid complications with useCallback.
  // This components only runs in development.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function closePreview() {
    if (preview) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(undefined);
  }

  function getPreviewImageDimensions(
    imageUrl: string
  ): Promise<PreviewDimensions> {
    return new Promise((resolve) => {
      const tmpImageEl = document.createElement('img');
      tmpImageEl.src = imageUrl;
      tmpImageEl.onload = () => {
        resolve({
          width: tmpImageEl.naturalWidth,
          height: tmpImageEl.naturalHeight
        });
      };
    });
  }

  if (preview?.dimensions) {
    return (
      <CapturePreviewContainer id="capture-preview">
        <PreviewImage ref={imageElement} src={preview.url} />
        <Button onClick={closePreview}>Close</Button>
        <div>
          Dimensions:{' '}
          <output>
            {preview.dimensions.width}x{preview.dimensions.height}.
          </output>
          <br />
          Size: <output>{preview.size / 1000} kilobytes.</output>
        </div>
      </CapturePreviewContainer>
    );
  } else return null;
};

const PreviewImage = styled.img`
  max-height: var(--scanning-area-height-portrait);
  max-width: ${Number(globalThis.visualViewport?.width) - 50}px;

  @media screen and (orientation: landscape) {
    max-height: var(--scanning-area-height-landscape);
  }
`;

const CapturePreviewContainer = styled.section`
  display: flex;
  flex-direction: column;
  background-color: white;
  gap: var(--medium);
  padding: var(--medium);
  // Centering of absolutely placed elements
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${zIndexes.debug};
`;
