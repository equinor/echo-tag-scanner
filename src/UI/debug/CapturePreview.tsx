import React, { SyntheticEvent, useState } from 'react';
import styled from 'styled-components';

import { Button, Icon } from '@equinor/eds-core-react';
import { useEffectAsync } from '@equinor/echo-utils';

import { zIndexes } from '@const';
import { isNewCaptureEvent } from '@utils';

type PreviewDimensions = {
  width: number;
  height: number;
};

type Preview = {
  url: string;
  dimensions?: PreviewDimensions;
  size: number;
};

export const CapturePreview = (): JSX.Element | null => {
  const [show, setShow] = useState(false);

  const [captureDetails, setCaptureDetails] = useState<
    { url: string; size: number }[]
  >([]);

  useEffectAsync(async () => {
    globalThis.addEventListener('ets-capture', updateImageUrlFromEvent);

    async function updateImageUrlFromEvent(event: Event) {
      console.log('Debug image running', event);
      if (isNewCaptureEvent(event)) {
        // New event, clean up previous
        captureDetails.forEach((detail) => URL.revokeObjectURL(detail.url));

        // Store object urls
        const urls = event.detail.captures.map((capture) => ({
          url: URL.createObjectURL(capture),
          size: capture.size
        }));
        setCaptureDetails(urls);
        setShow(true);
      }
    }
    return globalThis.removeEventListener(
      'ets-capture',
      updateImageUrlFromEvent
    );
  }, []);

  function closePreview() {
    if (captureDetails) {
      captureDetails.forEach((detail) => URL.revokeObjectURL(detail.url));
    }
    setCaptureDetails([]);
    setShow(false);
  }

  if (!show) {
    return null;
  }

  return (
    <CapturePreviewContainer id="capture-preview">
      <Carousel imageDetails={captureDetails} />
      <Button onClick={closePreview}>Close</Button>
    </CapturePreviewContainer>
  );
};

type CarouselProps = {
  imageDetails: { url: string; size: number }[];
};
function Carousel({ imageDetails }: CarouselProps) {
  const [index, setIndex] = useState(0);

  function next() {
    const nextIndex = index >= imageDetails.length ? 0 : index + 1;
    setIndex(nextIndex);
  }

  function prev() {
    const nextIndex = index <= 0 ? imageDetails.length : index - 1;
    setIndex(nextIndex);
  }

  return (
    <CarouselContainer>
      <PrevButton variant="ghost_icon" onClick={prev}>
        <Icon name="arrow_back_small" />
      </PrevButton>
      <OneImage url={imageDetails[index].url} size={imageDetails[index].size} />
      <NextButton variant="ghost_icon" onClick={next}>
        <Icon name="arrow_forward_small" />
      </NextButton>
    </CarouselContainer>
  );
}

type OneImageProps = {
  url: string;
  size: number;
};

function OneImage({ url, size }: OneImageProps) {
  const [dimensions, setDimensions] = useState<
    { width: number; height: number } | undefined
  >(undefined);

  function onImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    // TODO: resolve image size here
    setDimensions({ width: 300, height: 300 });
  }

  return (
    <>
      <PreviewImage src={url} onLoad={onImageLoad} />
      <div>
        {dimensions && (
          <>
            Dimensions:{' '}
            <output>
              {dimensions.width}x{dimensions.height}.
            </output>
          </>
        )}
        <br />
        Size: <output>{size / 1000} kilobytes.</output>
      </div>
    </>
  );
}

const CarouselContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

const PrevButton = styled(Button)`
  position: absolute;
  left: 0;
  top: 50%;
`;
const NextButton = styled(Button)`
  position: absolute;
  right: 0;
  top: 50%;
`;

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
