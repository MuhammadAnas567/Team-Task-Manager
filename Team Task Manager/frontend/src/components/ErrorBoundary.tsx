// frontend/src/components/ErrorBoundary.tsx

import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React render failed', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
          <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-rose-200">
              App render error
            </p>
            <h1 className="mt-3 text-3xl font-black">The app could not render.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Restart the dev server and hard refresh the browser. Error: {this.state.error.message}
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
