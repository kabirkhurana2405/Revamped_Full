import { Component } from "react";
import { LogoMark } from "./Logo";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div
          data-testid="error-boundary-fallback"
          className="flex min-h-screen flex-col items-center justify-center bg-[#F5F3EF] px-6 text-center"
        >
          <LogoMark size={56} />
          <h1 className="mt-6 font-display text-2xl font-extrabold tracking-tight text-[#121212]">
            SOMETHING GLITCHED.
          </h1>
          <p className="mt-3 max-w-sm font-mono2 text-[10px] leading-relaxed tracking-[0.2em] text-[#121212]/55">
            A TEMPORARY RENDER ERROR — ONE RELOAD SORTS IT.
          </p>
          <button
            data-testid="error-reload-btn"
            onClick={() => window.location.reload()}
            className="mt-8 rounded-full bg-[#121212] px-10 py-4 font-mono2 text-[11px] tracking-[0.28em] text-[#F5F3EF] transition-colors hover:bg-[#1E3A2B]"
          >
            RELOAD
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
