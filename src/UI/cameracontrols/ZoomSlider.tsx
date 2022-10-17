import React from 'react';
import styled from 'styled-components';
import { Slider as EDSSlider } from '@equinor/eds-core-react';
import { ZoomSteps } from '@types';

interface ZoomSliderProps {
  onSlide: (newZoomValue: ZoomSteps) => void;
  zoomInputRef: (input: HTMLInputElement) => void;
  zoomOptions?: MediaSettingsRange;
}

/** A component that renders a slider element that allows the user to perform native digital zoom. */
const ZoomSlider = (props: ZoomSliderProps): JSX.Element => {
  function changeSlide(
    event: React.FormEvent<HTMLDivElement>,
    newValue: number | number[]
  ) {
    if (typeof newValue === 'number' && isWithinZoomSteps(newValue)) {
      props.onSlide(newValue);
    }

    function isWithinZoomSteps(value: number): value is ZoomSteps {
      return value >= 1 && value <= 3;
    }
  }
  return (
    <SliderWrapper>
      <EDSSlider
        onChange={changeSlide}
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
