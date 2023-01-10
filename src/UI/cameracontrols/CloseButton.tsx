import React from 'react';
import styled from 'styled-components';
import { Icon, Button } from '@equinor/eds-core-react';

export const CloseButton = (): JSX.Element => {
  function goToEcho() {
    if (globalThis.history.state != null) history.back();
    else {
      // In this case, no prior navigation has happened, ie the user has directly entered the tag scanner.
      globalThis.location.href = globalThis.location.origin;
    }
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
