import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Button, Icon } from '@equinor/eds-core-react';
import { useEffectAsync } from '@equinor/echo-utils';

import { zIndexes } from '@const';
import { isNewCaptureEvent } from '@utils';
import { arrow_back, arrow_forward } from '@equinor/eds-icons';

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

  useEffect(() => {
    function handleCaptures(event: Event) {
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

    globalThis.addEventListener('ets-capture', handleCaptures);
    return () => globalThis.removeEventListener('ets-capture', handleCaptures);
  }, [captureDetails]);

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
    let nextIndex = index + 1;

    if (nextIndex >= imageDetails.length) {
      nextIndex = 0;
    }

    setIndex(nextIndex);
  }

  function prev() {
    let nextIndex = index - 1;

    if (nextIndex < 0) {
      nextIndex = imageDetails.length - 1;
    }

    setIndex(nextIndex);
  }

  return (
    <CarouselContainer>
      <PrevButton variant="contained_icon" onClick={prev}>
        <Icon data={arrow_back} color="black" />
      </PrevButton>
      <OneImage
        // Added key here so that react creates a new component when index is changed
        // to help with onmount dimensions calculations
        key={index}
        description={`${index + 1}/${imageDetails.length}`}
        url={imageDetails[index].url}
        size={imageDetails[index].size}
      />
      <NextButton variant="contained_icon" onClick={next}>
        <Icon data={arrow_forward} color="black" />
      </NextButton>
    </CarouselContainer>
  );
}

type OneImageProps = {
  url: string;
  size: number;
  description: string;
};

function OneImage({ url, size, description }: OneImageProps) {
  const [dimensions, setDimensions] = useState<
    { width: number; height: number } | undefined
  >(undefined);

  useEffectAsync(
    async (signal) => {
      const img = document.createElement('img');
      img.onload = () => {
        if (!signal.aborted)
          setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;

      return () => {
        // This will interrupt loading of the image
        img.src = '';
      };
    },
    [url]
  );

  return (
    <div>
      <PreviewImage src={url} />
      <div>
        {description && <>Image: {description}</>}
        <br />
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
    </div>
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
