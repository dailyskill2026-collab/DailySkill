import React, { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, send to error monitoring service
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-bg-light dark:bg-bg-dark">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-secondary mb-3">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-xl mb-4 font-mono break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold active:opacity-90 transition"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="w-full px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-primary transition"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
