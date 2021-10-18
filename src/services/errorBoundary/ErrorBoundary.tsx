import { Component } from 'react';
import { Typography, Button } from '@equinor/eds-core-react';
import styles from './styles.less';

interface ErrorBoundaryState {
  errorType?: unknown;
  message?: string;
}

class ErrorBoundary extends Component {
  public state: ErrorBoundaryState = {
    errorType: undefined,
    message: undefined
  };

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({
      errorType: event.type,
      message: event.reason.message
    });
  };

  componentDidMount(): void {
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { errorType: error.name, message: error.message };
  }

  componentDidCatch(error: unknown, errorInfo: unknown): void {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'AbortError':
        case 'NotAllowedError':
        case 'NotFoundError':
        case 'NotReadableError':
        case 'OverconstrainedError':
        case 'SecurityError':
        case 'TypeError':
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
          this.setState({ errorType: error.name, message: error.message });
          break;
        default:
          this.setState({ errorType: 'Unknown error type', message: error.message });
      }
    } else if (error instanceof Error) {
      this.setState({ errorType: error.name, message: error.message });
    } else {
      this.setState({ errorType: 'Unknown error type', message: 'No error message was found' });
    }
  }

  render(): React.ReactNode {
    if (this.state.errorType) {
      return (
        <main className={styles.main}>
          <article className={styles.errorWrapper}>
            <section>
              <Typography variant="h1">An error has occured</Typography>
              <Typography variant="ingress">Check the messages below.</Typography>
            </section>
            <aside className={styles.errorAdditionalInfo}>
              <Typography variant="body_short_bold">{this.state.message}</Typography>
              <Typography variant="body_short_bold">
                The type of error was: {this.state.errorType}
              </Typography>
            </aside>
          </article>
          <form className={styles.form}>
            <Button onClick={() => this.setState({ errorType: undefined, message: undefined })}>
              Clear error
            </Button>
          </form>
        </main>
      );
    } else {
      return this.props.children;
    }
  }
}

export { ErrorBoundary };
