import React, { useState } from 'react';
import { Button, Snackbar } from '@equinor/eds-core-react';
import { etsStorage } from '@utils';
import styled from 'styled-components';

export const ZoomTutorial = (): JSX.Element | null => {
  const [dismissed, setDismissed] = useState(
    Boolean(etsStorage.read('zoom-tutorial-dismissed'))
  );

  function handleDismiss() {
    const writeSuccess = etsStorage.write('zoom-tutorial-dismissed', 'true');

    if (writeSuccess) {
      setDismissed(true);
    }
  }

  if (!dismissed) {
    return (
      <ZoomTutorialSnackbar
        open
        placement="bottom-left"
        autoHideDuration={30000} // 30 seconds, but this will not cause a dismissal.
        onClick={handleDismiss}
      >
        The camera can be zoomed with a double tap on the viewfinder.
        <br />
        <br />
        Tap on me to dimiss this message.
      </ZoomTutorialSnackbar>
    );
  } else return null;
};

const ZoomTutorialSnackbar = styled(Snackbar)`
  position: fixed;
  bottom: 20%;
  width: 200px;

  @media screen and (orientation: landscape) {
    bottom: 5%;
    left: 10%;
  }
`;
