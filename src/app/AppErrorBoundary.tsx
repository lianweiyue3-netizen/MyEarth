import { Component, type ReactNode } from "react";
import { ErrorFallback } from "../ui/ErrorFallback";
import type { AppError } from "../shared/domain";

type Props = {
  children: ReactNode;
};

type State = {
  error?: AppError;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(): State {
    return {
      error: {
        code: "cesium-init-failed",
        severity: "fatal",
        publicMessage:
          "MyEarth hit an unexpected runtime error before the 3D view could continue.",
        recoverable: false
      }
    };
  }

  componentDidCatch(): void {
    // Public UI intentionally avoids stack traces.
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
