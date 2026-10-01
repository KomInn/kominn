import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneCheckbox, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SaksbehandlingWebPartStrings';
import { Saksbehandling } from './components/Saksbehandling';
import { createDataService, type IDataService } from '../../shared/services';
import { KomInnProvider } from '../../shared/components';
import type { CaseWorkerStatus } from '../../shared/models';

export interface ISaksbehandlingWebPartProps {
  showSubmitted: boolean;
  showRaised: boolean;
  showEvaluating: boolean;
  showAccepted: boolean;
  showRejected: boolean;
  maxItems: number;
  siteUrl: string;
}

export default class SaksbehandlingWebPart extends BaseClientSideWebPart<ISaksbehandlingWebPartProps> {
  private _service?: IDataService;
  private theme?: IReadonlyTheme;

  /** Datalaget opprettes ved første bruk. SharePoint kan kalle render (via onThemeChanged) før onInit er ferdig. */
  private get service(): IDataService {
    if (!this._service) this._service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
    return this._service;
  }

  private defaultStatuses(): CaseWorkerStatus[] {
    const p = this.properties;
    const list: CaseWorkerStatus[] = [];
    if (p.showSubmitted !== false) list.push('Sendt inn');
    if (p.showRaised !== false) list.push('Løftes til linja');
    if (p.showEvaluating !== false) list.push('Vurderes');
    if (p.showAccepted === true) list.push('Godtatt');
    if (p.showRejected === true) list.push('Avslått');
    return list;
  }

  public render(): void {
    ReactDom.render(
      React.createElement(
        KomInnProvider,
        { theme: this.theme, instanceId: this.instanceId, service: this.service },
        React.createElement(Saksbehandling, { defaultStatuses: this.defaultStatuses(), maxItems: this.properties.maxItems ?? 500 })
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
              groupName: strings.DefaultFilterGroupName,
              groupFields: [
                PropertyPaneCheckbox('showSubmitted', { text: 'Sendt inn' }),
                PropertyPaneCheckbox('showRaised', { text: 'Løftes til linja' }),
                PropertyPaneCheckbox('showEvaluating', { text: 'Vurderes' }),
                PropertyPaneCheckbox('showAccepted', { text: 'Godtatt' }),
                PropertyPaneCheckbox('showRejected', { text: 'Avslått' }),
                PropertyPaneSlider('maxItems', { label: strings.MaxItemsLabel, min: 50, max: 2000, step: 50 })
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
