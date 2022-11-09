import React, { useEffect, useState } from 'react';
import { Camera } from '@cameraLogic';
import styled from 'styled-components';
import { Button } from '@equinor/eds-core-react';
import { isCustomEvent } from '@utils';
import { zIndexes } from '@const';

interface CapturePreviewProps {
  camera: Camera;
}

export const CapturePreview = (
  props: CapturePreviewProps
): JSX.Element | null => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    globalThis.addEventListener('ets-capture', (e) =>
      updateImageUrlFromEvent(e)
    );

    function updateImageUrlFromEvent(event: Event) {
      // TODO: Type guard the Event.detail contents.
      //@ts-ignore
      setImageUrl(event.detail.url);
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
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(undefined);
  }

  if (imageUrl) {
    return (
      <CapturePreviewContainer id="capture-preview">
        <PreviewImage src={imageUrl} />
        <Button onClick={closePreview}>Close</Button>
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
