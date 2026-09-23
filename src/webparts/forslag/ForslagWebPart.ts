import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ForslagWebPartStrings';
import { Forslag } from './components/Forslag';
import type { IForslagProps } from './components/IForslagProps';
import { createDataService, SUGGESTION_QUERY_KEY, type IDataService } from '../../shared/services';
import { KomInnProvider } from '../../shared/components';
import { getQueryNumber } from '../../shared/utils';

export interface IForslagWebPartProps {
  showMap: boolean;
  showEvaluation: boolean;
  showComments: boolean;
  showRelated: boolean;
  /** Fast forslag-id, brukes når siden ikke har ?forslag=<id>. */
  fixedId: string;
  siteUrl: string;
}

export default class ForslagWebPart extends BaseClientSideWebPart<IForslagWebPartProps> {
  private service!: IDataService;
  private theme?: IReadonlyTheme;

  protected async onInit(): Promise<void> {
    this.service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
  }

  public render(): void {
    const p = this.properties;
    const fixed = parseInt(p.fixedId ?? '', 10);
    const props: IForslagProps = {
      suggestionId: getQueryNumber(SUGGESTION_QUERY_KEY) ?? (isNaN(fixed) ? undefined : fixed),
      showMap: p.showMap !== false,
      showEvaluation: p.showEvaluation !== false,
      showComments: p.showComments !== false,
      showRelated: p.showRelated !== false
    };
    ReactDom.render(
      React.createElement(KomInnProvider, { theme: this.theme, instanceId: this.instanceId, service: this.service }, React.createElement(Forslag, props)),
      this.domElement
    );
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    if (propertyPath === 'siteUrl') this.service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this.theme = currentTheme;
    this.render();
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
              groupName: strings.DisplayGroupName,
              groupFields: [
                PropertyPaneToggle('showMap', { label: strings.ShowMapLabel, onText: 'På', offText: 'Av' }),
                PropertyPaneToggle('showComments', { label: strings.ShowCommentsLabel, onText: 'På', offText: 'Av' }),
                PropertyPaneToggle('showRelated', { label: strings.ShowRelatedLabel, onText: 'På', offText: 'Av' }),
                PropertyPaneToggle('showEvaluation', { label: strings.ShowEvaluationLabel, onText: 'På', offText: 'Av' })
              ]
            },
            {
              groupName: strings.SourceGroupName,
              groupFields: [
                PropertyPaneTextField('fixedId', { label: strings.FixedIdLabel, description: strings.FixedIdDescription }),
                PropertyPaneTextField('siteUrl', { label: strings.SiteUrlFieldLabel, description: strings.SiteUrlFieldDescription })
              ]
            }
          ]
        }
      ]
    };
  }
}
