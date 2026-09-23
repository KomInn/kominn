import * as React from 'react';
import { MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';

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
      return (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Webdelen kunne ikke vises.</MessageBarTitle> {this.state.error.message}
          </MessageBarBody>
        </MessageBar>
      );
    }
    return this.props.children;
  }
}
