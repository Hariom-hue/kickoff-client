import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error("App crashed:", err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "3rem", letterSpacing: "0.1em", marginBottom: 16 }}>
              <span style={{ color: "#fff" }}>KICK</span>
              <span style={{ color: "#c8ff00" }}>OFF</span>
            </h1>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 24 }}>Something went wrong. Please refresh the page.</p>
            <button onClick={() => window.location.reload()}
              style={{ padding: "12px 28px", background: "#c8ff00", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}