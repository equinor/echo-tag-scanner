import { Slider } from '@equinor/eds-core-react';
import { Ref } from 'react';
import styles from './styles.less';

interface ZoomSliderProps {
  zoomInputRef: Ref<HTMLInputElement>;
  zoomOptions?: MediaSettingsRange;
}

const ZoomSlider = (props: ZoomSliderProps): JSX.Element => {
  return (
    <div className={styles.edsSlider}>
      <Slider
        disabled={Boolean(props.zoomOptions)}
        value={1}
        min={props.zoomOptions?.min ?? 1}
        max={props.zoomOptions?.max ?? 5}
        step={props.zoomOptions?.step ?? 0.5}
        ariaLabelledby="zoom-slider"
        minMaxDots={false}
        minMaxValues={false}
        ref={props.zoomInputRef}
      />
    </div>
  );
};

export { ZoomSlider };
