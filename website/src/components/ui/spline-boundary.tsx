"use client";

import React from "react";

/**
 * <Suspense> handles the *loading* state of a lazy component, but NOT errors
 * thrown while the chunk or the remote scene is fetched. Without this boundary
 * a failed Spline fetch (offline visitor, blocked CDN, ad-blocker, Spline
 * outage) propagates up and takes the whole page down with a client-side
 * exception. This keeps the failure local to the 3D panel.
 */
export class SplineBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[SplineBoundary] 3D scene failed to load:", error.message);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
