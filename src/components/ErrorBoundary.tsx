import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("App error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center gap-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md break-words">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <Button onClick={this.handleReload}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
