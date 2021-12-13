import { CircularProgress, Dialog } from '@equinor/eds-core-react';
import styled from 'styled-components';

const ScanningIndicator = (): JSX.Element => {
  return (
    <Dialogue>
      <CircularProgress variant="indeterminate"></CircularProgress>
      <span>
        We got your image. <br />
        Analyzing...
      </span>
    </Dialogue>
  );
};

const Dialogue = styled(Dialog)`
  justify-content: center;
  z-index: 2;
  width: auto;
  height: auto;
  padding: 0 1rem;

  > span {
    margin: 0 auto;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  > svg {
    margin: 0 auto;
    margin-top: 1rem;
  }
`;

export { ScanningIndicator };
