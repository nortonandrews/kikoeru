// TODO: this entire thing is not being used at the moment, test later
import { Component } from 'inferno';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI, log error
    this.setState({ hasError: true, error, info });

    // eslint-disable-next-line no-console
    console.error(error, info);
  }

  render() {
    const { children } = this.props;
    const { hasError, error, info } = this.state;

    if (hasError) {
      return (
        <div className="uk-cover-container" uk-height-viewport>
          <div className="uk-position-center">
            <h2>Something went wrong:</h2>
            <p>{error}</p>
            <p className="uk-text-meta">{info}</p>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
