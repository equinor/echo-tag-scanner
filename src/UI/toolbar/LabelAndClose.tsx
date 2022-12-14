import React from 'react';
import { CloseButton, VersionNumber } from '@ui';
import styled from 'styled-components';
import { zIndexes } from '@const';
import { Typography } from '@equinor/eds-core-react';
import { isProduction } from '@utils';

export const LabelAndClose = (): JSX.Element => {
  return (
    <StyledLabelAndClose role="toolbar">
      <span>
        <ScanTagLabel variant="h5">Scan tag</ScanTagLabel>
        {!isProduction && <VersionNumber />}
      </span>

      <CloseButton />
    </StyledLabelAndClose>
  );
};

const ScanTagLabel = styled(Typography)`
  display: inline;
  font-weight: bold;
  margin-right: var(--small);
  color: white;
`;

const StyledLabelAndClose = styled.section`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: ${zIndexes.overlays};
  width: 100%;
  padding: 0 var(--medium);
  margin-top: var(--medium);
`;
