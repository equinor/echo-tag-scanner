import React from 'react';
import { Slider } from '@equinor/eds-core-react';
import { Ref } from 'react';
import styles from './styles.less';

interface ZoomSliderProps {
  zoomInputRef: Ref<HTMLInputElement>;
  deviceZoomCapable?: boolean;
}

const ZoomSlider = (props: ZoomSliderProps): JSX.Element => {
  return (
    <div className={styles.edsSlider}>
      <Slider
        disabled={!props.deviceZoomCapable}
        value={1}
        // 1x zoom
        min={1}
        // max 5x zoom. This should be queried from the device if possible.
        max={5}
        step={0.5}
        ariaLabelledby="zoom-slider"
        minMaxDots={false}
        minMaxValues={false}
        ref={props.zoomInputRef}
      />
    </div>
  );
};

// const StockSlider = () => {
//   const [zoomValue, setZoomValue] = useState(1);
//   return (
//     <div className={styles.sliderBackdrop}>
//       <input
//         type="range"
//         value={zoomValue}
//         min={1}
//         max={10}
//         step={0.5}
//         onChange={(e) => {
//           console.log(e.target.value);
//           setZoomValue(Number(e.target.value));
//         }}
//         ref={zoomInputRef}
//       />
//     </div>
//   );
// };

export { ZoomSlider };
