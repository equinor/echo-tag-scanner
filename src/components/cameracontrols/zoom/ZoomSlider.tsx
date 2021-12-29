import React from 'react';
import { Slider } from '@equinor/eds-core-react';
import { Ref } from 'react';
import styles from './styles.less';

interface ZoomSliderProps {
  onSlide: (event: React.FormEvent<HTMLDivElement>, newValue: number | number[]) => void;
  zoomInputRef: Ref<HTMLInputElement>;
  zoomOptions?: MediaSettingsRange;
}

const ZoomSlider = (props: ZoomSliderProps): JSX.Element => {
  return (
    <div className={styles.edsSlider}>
      <Slider
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
    </div>
  );
};

export { ZoomSlider };
