import React from 'react';
import styled from 'styled-components';
import { Button } from '@equinor/eds-core-react';

type OverconstrainedAlertProps = {
  technicalInfo: OverconstrainedError;
};

const OverconstrainedAlert = (
  props: OverconstrainedAlertProps
): JSX.Element => {
  props.technicalInfo.toString = function () {
    return this.constraint + ' , ' + this.message + ' , ' + this.name;
  };
  return (
    <AlertContainer>
      <Article>
        <Section>
          <ErrorHeader>We could not start your camera.</ErrorHeader>
          <p>
            Unfortunately, an error occured while we tried to start your rear
            camera. There could be a number of reasons for this:
          </p>
          <ul>
            <li> Another app or webpage might be using the camera.</li>
            <li> There might be something wrong with the camera hardware.</li>
          </ul>

          <p>
            You can test your camera{' '}
            <a href="https://webcamtests.com" target="_blank" rel="noreferrer">
              here
            </a>{' '}
            (opens in a new tab)
          </p>

          <p>Contact the Echo project if the issue seem to persist.</p>

          <TechnicalHeader>Technical information</TechnicalHeader>
          <code>{props.technicalInfo.toString()}</code>
        </Section>
        <hr />
      </Article>

      <ControlPanel>
        <Button variant="outlined" onClick={() => globalThis.history.back()}>
          Go back to Echo
        </Button>
        <Button variant="outlined" onClick={() => globalThis.location.reload()}>
          Refresh
        </Button>
      </ControlPanel>
    </AlertContainer>
  );
};

const ControlPanel = styled.fieldset`
  display: flex;
  justify-content: center;
  gap: 1rem;
  border: none;
  grid-area: control-panel;
`;

const ErrorHeader = styled.h1`
  font-size: 1.4rem;
  font-weight: bold;
`;

const TechnicalHeader = styled.h2`
  font-size: 1rem;
  font-weight: bold;
`;

const AlertContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100vh;
  width: 100vw;

  // Give some room in the bottom for the Echo bar
  padding-bottom: 3rem;
`;

const Article = styled.article`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80%;
  grid-area: error-details;
`;

const Section = styled.section`
  margin: 0 var(--medium);
`;

export { OverconstrainedAlert };
