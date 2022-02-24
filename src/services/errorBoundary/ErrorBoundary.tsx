import React from 'react';
import styled from 'styled-components';

import { eventHub } from '@equinor/echo-core';
import { Button, Typography, Dialog, Scrim, Banner, Icon } from '@equinor/eds-core-react';
import { warning_filled } from '@equinor/eds-icons';

import { ErrorKey } from '@enums';
import { EchoCameraError } from '@types';

interface ErrorBoundaryProps {
  stackTraceEnabled: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, unknown> {
  state = {
    hasError: false,
    // User friendly message
    userMessage: undefined,

    // Nerd stats
    devMessage: undefined,

    // "high" | "low"
    severity: undefined
  };

  private listenerCleanup?: () => void;

  componentDidCatch(error: unknown, info: unknown): void {
    if (error instanceof Error) {
      this.setState({ hasError: true, devMessage: error, userMessage: info });
    } else {
      this.setState({ hasError: true, userMessage: 'An unknown error has occured' });
    }
  }

  componentDidMount(): void {
    this.listenerCleanup = eventHub.subscribe(
      ErrorKey.EchoCameraApiError,
      (error: EchoCameraError) => this.errorListener(error)
    );
  }

  componentWillUnmount(): void {
    if (this.listenerCleanup) {
      this.listenerCleanup();
    }
  }

  private parseError(error: unknown): JSX.Element | undefined {
    if (error instanceof Error) {
      return (
        <article>
          <section>
            <dl>
              <div>
                <dt>Type of error</dt>
                <dd>
                  <em>{error.name ?? 'Unknown type of error.'}</em>
                </dd>
              </div>

              <div>
                <dt>Message</dt>
                <dd>
                  <em>{error.message ?? 'No message provided.'}</em>
                </dd>
              </div>

              {this.props.stackTraceEnabled && (
                <div>
                  <details>
                    <summary>Stacktrace</summary>
                    <article>{error.stack}</article>
                  </details>
                </div>
              )}
            </dl>
          </section>
        </article>
      );
    }
  }

  private errorListener(error: EchoCameraError): void {
    this.setState({
      hasError: true,
      userMessage: error.userMessage,
      devMessage: error.devMessage,
      severity: error.severity
    });
  }

  private resetState(): void {
    this.setState({
      hasError: false,
      userMessage: undefined,
      devMessage: undefined,
      severity: undefined
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      console.group('ErrorBoundary');
      console.info(this.state);
      console.groupEnd();
      if (this.state.severity === 'high') {
        return (
          <>
            <Scrim open>
              <ErrorDialogue>
                <Dialog.Title>
                  <h3>An error has occured</h3>
                </Dialog.Title>
                <Dialog.CustomContent>
                  <ErrorBoundaryContent>
                    <Typography variant="body_long">
                      Smart Portal ran into an issue. Check the marked message
                      below for more details.
                      <br />
                      <br />
                      <mark>
                        {this.state.userMessage ||
                          'An unknown error has occured.'}
                      </mark>
                    </Typography>
                    <Developer>
                      <Details>
                        <summary>Developer information</summary>
                        {this.state.devMessage
                          ? this.parseError(this.state.devMessage)
                          : 'No developer information available'}
                      </Details>
                    </Developer>
                    <Button onClick={() => this.resetState()}>Close</Button>
                  </ErrorBoundaryContent>
                </Dialog.CustomContent>
              </ErrorDialogue>
            </Scrim>
            {this.props.children}
          </>
        );
      } else {
        return (
          <>
            <Banner>
              <Banner.Icon variant="warning">
                <Icon data={warning_filled} />
              </Banner.Icon>
              <Banner.Message>
                {this.state.userMessage ?? 'An unknown error has occured.'}
              </Banner.Message>
              <Banner.Actions>
                <Button variant="outlined" onClick={() => this.setState({ severity: 'high' })}>
                  Show details
                </Button>
                <Button onClick={() => this.resetState()}>Dismiss</Button>
              </Banner.Actions>
            </Banner>
            {this.props.children}
          </>
        );
      }
    } else {
      return this.props.children;
    }
  }
}

const ErrorBoundaryContent = styled.section`
  display: flex;
  flex-direction: column;
`;

const ErrorDialogue = styled(Dialog)`
  max-width: 60vw;
  max-height: 60vh;
  width: unset;
  overflow-y: auto;
`;

const Details = styled.details`
  cursor: pointer;
`;

const Developer = styled.section`
  margin-top: 2rem;
  max-width: 60vw;
  padding: 1rem;
  padding-top: 0;
`;

export { ErrorBoundary };
