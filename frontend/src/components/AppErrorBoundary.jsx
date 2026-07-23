import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, information) {
    console.error(
      "Savora page crashed:",
      error,
      information
    );
  }

  resetPage = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-error-state">
          <div className="page-error-card">
            <span className="page-error-icon">
              ⚠️
            </span>

            <h2>This page could not load</h2>

            <p>
              Your session is still active. Return to
              the dashboard or reload this page.
            </p>

            <button
              type="button"
              onClick={() => {
                this.resetPage();
                this.props.onRecover?.();
              }}
            >
              Return to dashboard
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
