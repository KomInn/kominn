import * as React from 'react';

interface State {
  error?: Error;
}

/**
 * Viser feilen i stedet for en blank webdel når noe krasjer under rendering,
 * og skriver detaljene til konsollen.
 */
export class ErrorBoundary extends React.Component<{ children?: React.ReactNode }, State> {
  public state: State = {};

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[KomInn] Webdelen krasjet under rendering', error, info.componentStack);
  }

  public render(): React.ReactNode {
    if (this.state.error) {
      // Ren HTML, uten Fluent: feilgrensen må ikke selv kunne feile.
      return (
        <div role="alert" style={{ padding: '8px 12px', borderLeft: '4px solid #a4262c', background: 'rgba(164, 38, 44, 0.08)' }}>
          <strong>Webdelen kunne ikke vises.</strong> {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
