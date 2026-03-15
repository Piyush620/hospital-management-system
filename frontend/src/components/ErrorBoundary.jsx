import { Component } from "react";
import { Box, Button, Typography } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 4,
            textAlign: "center"
          }}
        >
          <Typography variant="h4" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          {process.env.NODE_ENV === "development" && (
            <details style={{ marginTop: 16 }}>
              <summary>Error Details (Dev Mode)</summary>
              <pre style={{ textAlign: "left", fontSize: "12px" }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;