import React from 'react';
import styled from 'styled-components';

/** This component is intended to sit between the viewfinder and the background Echo markup in order to cover up the notch safe areas which may or may not be enabled.*/
const Backdrop = (): JSX.Element => {
  return <SafeAreaCover id="safe-area-cover" />;
};

const SafeAreaCover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  z-index: 2;
`;

export { Backdrop };
