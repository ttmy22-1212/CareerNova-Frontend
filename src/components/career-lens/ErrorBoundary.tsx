'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.resetError) ?? (
          <ErrorState error={this.state.error} onReset={this.resetError} />
        )
      );
    }

    return this.props.children;
  }
}

export function ErrorState({
  error,
  onReset,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
}: {
  error?: Error;
  onReset?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h3 className="font-semibold text-red-900 dark:text-red-300">{title}</h3>
        <p className="mt-1 text-sm text-red-700 dark:text-red-200">{message}</p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mt-3 text-left">
            <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400 hover:underline">
              Error details
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-800 dark:bg-red-900/50 dark:text-red-200">
              {error.message}
            </pre>
          </details>
        )}
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
      {Icon && <Icon className="h-12 w-12 text-slate-400" />}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
