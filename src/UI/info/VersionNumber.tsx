import React from 'react';
import pk from '../../../package.json';
import { isDevelopment, isQA, isLocalDevelopment } from '@utils';
import { zIndexes } from '@const';
import styled from 'styled-components';

export const VersionNumber = (): JSX.Element => {
  function getEnv() {
    if (isLocalDevelopment) return 'Local Dev';
    if (isDevelopment) return 'Dev';
    if (isQA) return 'QA';
    console.warn('Unable to determine the running build.');
  }

  return (
    <Mark style={{ zIndex: zIndexes.versionNumber }}>
      {pk.version} {getEnv()}
    </Mark>
  );
};
const Mark = styled.mark`
  position: absolute;
  top: 64px; // Give some space for the echo buttons.
  left: 0;
  z-index: ${zIndexes.versionNumber};
  user-select: none;
`;
