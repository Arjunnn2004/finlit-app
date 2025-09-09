import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Check if it's a Firestore error
    if (error.message.includes('FIRESTORE') || error.message.includes('INTERNAL ASSERTION FAILED')) {
      console.log('Firestore error detected, attempting to recover...');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-red-700 dark:text-red-300 text-lg font-semibold mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">
            {this.state.error?.message.includes('FIRESTORE') 
              ? 'Database connection issue. Please try refreshing the page.'
              : 'An unexpected error occurred. Please try refreshing the page.'
            }
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
