import React, { Dispatch, Ref, SetStateAction } from 'react';
import styled from 'styled-components';
import { Slider as EDSSlider } from '@equinor/eds-core-react';

interface ZoomSliderProps {
  onSlide: (
    event: React.FormEvent<HTMLDivElement>,
    newValue: number | number[]
  ) => void;
  zoomInputRef: (input: HTMLInputElement) => void;
  zoomOptions?: MediaSettingsRange;
}

const ZoomSlider = (props: ZoomSliderProps): JSX.Element => {
  return (
    <SliderWrapper>
      <EDSSlider
        onChange={props.onSlide}
        disabled={!Boolean(props.zoomOptions)}
        value={1}
        min={props.zoomOptions?.min}
        max={props.zoomOptions?.max}
        step={props.zoomOptions?.step}
        ariaLabelledby="zoom-slider"
        minMaxDots={false}
        minMaxValues={false}
        ref={props.zoomInputRef}
      />
    </SliderWrapper>
  );
};

const SliderWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;

  > div {
    width: 40%;

    > output {
      // Hide the zoom output value.
      display: none;
    }
  }

  @media screen and (orientation: landscape) {
    transform: rotate(-90deg);
    width: 100%;

    > div {
      width: 100%;
    }
  }
`;

export { ZoomSlider };
