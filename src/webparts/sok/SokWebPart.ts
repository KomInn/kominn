import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SokWebPartStrings';
import { Sok } from './components/Sok';
import { createDataService, type IDataService } from '../../shared/services';
import { KomInnProvider } from '../../shared/components';

export interface ISokWebPartProps {
  placeholder: string;
  maxResults: number;
  siteUrl: string;
}

export default class SokWebPart extends BaseClientSideWebPart<ISokWebPartProps> {
  private _service?: IDataService;
  private theme?: IReadonlyTheme;

  /** Datalaget opprettes ved første bruk. SharePoint kan kalle render (via onThemeChanged) før onInit er ferdig. */
  private get service(): IDataService {
    if (!this._service) this._service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
    return this._service;
  }

  public render(): void {
    ReactDom.render(
      React.createElement(
        KomInnProvider,
        { theme: this.theme, instanceId: this.instanceId, service: this.service },
        React.createElement(Sok, { placeholder: this.properties.placeholder ?? '', maxResults: this.properties.maxResults ?? 8 })
      ),
      this.domElement
    );
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    if (propertyPath === 'siteUrl') this._service = undefined;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this.theme = currentTheme;
    if (this.renderedOnce) this.render();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.SettingsGroupName,
              groupFields: [
                PropertyPaneTextField('placeholder', { label: strings.PlaceholderLabel }),
                PropertyPaneSlider('maxResults', { label: strings.MaxResultsLabel, min: 3, max: 20, step: 1 })
              ]
            },
            {
              groupName: strings.SourceGroupName,
              groupFields: [PropertyPaneTextField('siteUrl', { label: strings.SiteUrlFieldLabel, description: strings.SiteUrlFieldDescription })]
            }
          ]
        }
      ]
    };
  }
}
