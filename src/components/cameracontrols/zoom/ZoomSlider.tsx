import React, {Ref} from 'react';
import styled from 'styled-components';
import { Slider as EDSSlider} from '@equinor/eds-core-react';


interface ZoomSliderProps {
  onSlide: (event: React.FormEvent<HTMLDivElement>, newValue: number | number[]) => void;
  zoomInputRef: Ref<HTMLInputElement>;
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
    position: absolute;
    bottom: 20%;
    width: 30%;
    width: 100%;
    text-align: center;
  
    > div {
      width: 40%;

      > output {
        // Hide the zoom output value.
        display: none;
      }
    }
`

export { ZoomSlider };
