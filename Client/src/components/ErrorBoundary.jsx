import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-zinc-900 border border-white/5 rounded-2xl">
          Asset Loading Halted
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
