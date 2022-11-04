import React from 'react';
import styled from 'styled-components';
import { eventHub } from '@equinor/echo-core';
import { BaseError } from '@equinor/echo-base';
import {
  Button,
  Typography,
  Dialog,
  Scrim,
  Banner,
  Icon
} from '@equinor/eds-core-react';
import { warning_filled } from '@equinor/eds-icons';
import { ErrorKey, zIndexes } from '@const';
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
      this.setState({
        hasError: true,
        userMessage: 'An unknown error has occured'
      });
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

  private getInnerError(error: BaseError) {
    const details = error.getInnerErrorProperties().details;
    if (typeof details === 'string') {
      return details;
    } else {
      return JSON.stringify(details);
    }
  }

  private parseError(error: unknown): JSX.Element | undefined {
    let [errorMessage, errorType] = (() => {
      if (error instanceof BaseError) {
        return [this.getInnerError(error), error.name];
      } else if (error instanceof Error) {
        return [error.message, error.name];
      } else {
        return [
          (error as unknown as Record<string, string>).toString(),
          undefined
        ];
      }
    })();

    return (
      <article>
        <section>
          <dl>
            <div>
              <dt>Type of error</dt>
              <dd>
                <em>{errorType ?? 'Unknown type of error.'}</em>
              </dd>
            </div>

            <div>
              <dt>Message</dt>
              <dd>
                <em>{errorMessage ?? 'No message provided.'}</em>
              </dd>
            </div>
          </dl>
        </section>
      </article>
    );
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
  // if (this.state.severity === 'high') {

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.state.severity === 'high') {
        return (
          <>
            <Backdrop open>
              <ErrorDialogue open>
                <DialogueTitleSection>
                  <DialogueTitle variant="h4">
                    An error has occured
                  </DialogueTitle>
                </DialogueTitleSection>
                <Dialog.CustomContent>
                  <ErrorBoundaryContent>
                    <section>
                      The Camera ran into an issue. Check the marked message
                      below for more details.
                      <p>
                        <mark>
                          {this.state.userMessage ||
                            'An unknown error has occured.'}
                        </mark>
                      </p>
                      <p>
                        If you want to report this, be sure to expand
                        &quot;Developer information&quot; below
                      </p>
                    </section>
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
            </Backdrop>
            {this.props.children}
          </>
        );
      } else {
        return (
          <BannerContainer>
            <Banner>
              <Banner.Icon variant="warning">
                <Icon data={warning_filled} />
              </Banner.Icon>
              <Banner.Message>
                {this.state.userMessage ?? 'An unknown error has occured.'}
              </Banner.Message>
              <Banner.Actions>
                <Button
                  variant="outlined"
                  onClick={() => this.setState({ severity: 'high' })}
                >
                  Show details
                </Button>
                <Button onClick={() => this.resetState()}>Dismiss</Button>
              </Banner.Actions>
            </Banner>
            {this.props.children}
          </BannerContainer>
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

const BannerContainer = styled(Banner)`
  // ErrorBoundary popup will have the highest z-index.
  z-index: ${zIndexes.errorBoundary};
`;

const Backdrop = styled(Scrim)`
  // ErrorBoundary popup will have the highest z-index.
  z-index: ${zIndexes.errorBoundary};
`;

const ErrorDialogue = styled(Dialog)`
  max-width: unset !important;
  width: 80%;
  max-height: 60%;
  width: unset;
  overflow-y: auto;
`;

const Details = styled.details`
  cursor: pointer;
`;

const DialogueTitleSection = styled(Dialog.Title)`
  width: 100%;
  border-bottom: 1px solid var(--equiGray4);
`;

const DialogueTitle = styled(Typography)`
  padding: var(--small) 0;
  padding-left: var(--medium);
`;

const Developer = styled.section`
  margin-top: 2rem;
  max-width: 60%;
  padding: 1rem;
  padding-top: 0;
`;

export { ErrorBoundary };
