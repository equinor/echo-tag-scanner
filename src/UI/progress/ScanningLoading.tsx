import React from 'react';
import styled from 'styled-components';
import { CircularProgress, Dialog } from '@equinor/eds-core-react';

const ScanningIndicator = (message?: string | JSX.Element): JSX.Element => {
  function renderMessage() {
    if (typeof message === 'string') {
      return <span>{message || 'Analyzing...'}</span>;
    } else {
      return message;
    }
  }

  return (
    <Dialogue open>
      <CircularProgress variant="indeterminate"></CircularProgress>
      {renderMessage()}
    </Dialogue>
  );
};

const Dialogue = styled(Dialog)`
  justify-content: center;
  z-index: 2;
  width: auto;
  height: auto;
  padding: 0 1rem;
  max-width: unset !important;

  > span {
    margin: 0 auto;
    margin-bottom: 1rem;
    text-align: center;
  }

  > svg {
    margin: 0 auto;
    margin-top: 1rem;
  }
`;

export { ScanningIndicator };
