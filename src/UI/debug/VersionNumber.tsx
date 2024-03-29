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
    <Mark id="version-number-label" style={{ zIndex: zIndexes.versionNumber }}>
      {pk.version} {getEnv()}
    </Mark>
  );
};
const Mark = styled.mark`
  display: inline;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
`;
