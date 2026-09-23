import * as React from 'react';
import { FluentProvider, IdPrefixProvider, webDarkTheme, webLightTheme, type Theme } from '@fluentui/react-components';
import { createV9Theme } from '@fluentui/react-migration-v8-v9';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import type { IDataService } from '../services';
import { DataServiceProvider } from '../hooks';

export interface KomInnProviderProps {
  /** Tema fra SharePoint-siden (onThemeChanged i webdelen). */
  theme?: IReadonlyTheme;
  /** Webdelens instans-id, brukes til unike element-id-er når flere webdeler står på samme side. */
  instanceId: string;
  service: IDataService;
  children?: React.ReactNode;
}

/**
 * Setter opp Fluent UI v9 med temaet fra SharePoint-siden og gjør datalaget tilgjengelig for hooks.
 */
export const KomInnProvider: React.FC<KomInnProviderProps> = ({ theme, instanceId, service, children }) => {
  const v9Theme = React.useMemo<Theme>(() => {
    if (!theme || !theme.palette) return webLightTheme;
    try {
      return createV9Theme(theme as unknown as Parameters<typeof createV9Theme>[0], theme.isInverted ? webDarkTheme : webLightTheme);
    } catch {
      return theme.isInverted ? webDarkTheme : webLightTheme;
    }
  }, [theme]);

  return (
    <IdPrefixProvider value={`kominn-${instanceId}-`}>
      <FluentProvider theme={v9Theme} style={{ background: 'transparent' }}>
        <DataServiceProvider service={service}>{children}</DataServiceProvider>
      </FluentProvider>
    </IdPrefixProvider>
  );
};
