import React, { RefObject } from 'react';
import styled from 'styled-components';

interface ScanningAreaProps {
  captureAreaRef: RefObject<HTMLElement>;
}

const CaptureArea = (props: ScanningAreaProps): JSX.Element => {
  return <SvgContainer ref={props.captureAreaRef} />;
};

const SvgContainer = styled.section`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 300px;
  border: 3px dotted hotpink;
`;

export { CaptureArea };
