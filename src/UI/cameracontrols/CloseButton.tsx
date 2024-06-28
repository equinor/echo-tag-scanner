import React from 'react';
import styled from 'styled-components';
import { Icon, Button } from '@equinor/eds-core-react';

export const CloseButton = (): JSX.Element => {
  
  function goToEcho() {
    globalThis.location.replace("/");
  }

  return (
    <StyledCloseButton variant="contained_icon" onClick={goToEcho}>
      <Icon name="close" fill="black" />
    </StyledCloseButton>
  );
};

const StyledCloseButton = styled(Button)`
  background: rgba(0, 0, 0, 0);
  background: white;
`;
