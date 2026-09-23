import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, type IPropertyPaneField, type IPropertyPaneToggleProps, PropertyPaneTextField, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'NyttForslagWebPartStrings';
import { NyttForslag } from './components/NyttForslag';
import type { INyttForslagProps, NyttForslagSections } from './components/INyttForslagProps';
import { createDataService, type IDataService } from '../../shared/services';
import { KomInnProvider } from '../../shared/components';

export interface INyttForslagWebPartProps extends NyttForslagSections {
  introText: string;
  successText: string;
  competitionRef: string;
  siteUrl: string;
}

export default class NyttForslagWebPart extends BaseClientSideWebPart<INyttForslagWebPartProps> {
  private _service?: IDataService;
  private theme?: IReadonlyTheme;

  /** Datalaget opprettes ved første bruk. SharePoint kan kalle render (via onThemeChanged) før onInit er ferdig. */
  private get service(): IDataService {
    if (!this._service) this._service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
    return this._service;
  }

  public render(): void {
    const p = this.properties;
    const props: INyttForslagProps = {
      introText: p.introText ?? '',
      successText: p.successText ?? '',
      competitionRef: p.competitionRef ?? '',
      showAmount: p.showAmount !== false,
      showChallenges: p.showChallenges !== false,
      showSolution: p.showSolution === true,
      showUsefulForOthers: p.showUsefulForOthers === true,
      showTags: p.showTags !== false,
      showGoals: p.showGoals !== false,
      showImage: p.showImage !== false,
      showLocation: p.showLocation !== false,
      showInspiredBy: p.showInspiredBy !== false,
      displayMode: this.displayMode,
      webUrl: this.service.webUrl
    };
    ReactDom.render(
      React.createElement(KomInnProvider, { theme: this.theme, instanceId: this.instanceId, service: this.service }, React.createElement(NyttForslag, props)),
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
    const toggle = (key: keyof NyttForslagSections, label: string): IPropertyPaneField<IPropertyPaneToggleProps> => PropertyPaneToggle(key, { label, onText: 'På', offText: 'Av' });
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.TextsGroupName,
              groupFields: [
                PropertyPaneTextField('introText', { label: strings.IntroTextLabel, multiline: true, rows: 3 }),
                PropertyPaneTextField('successText', { label: strings.SuccessTextLabel, multiline: true, rows: 3 }),
                PropertyPaneTextField('competitionRef', { label: strings.CompetitionRefLabel, description: strings.CompetitionRefDescription })
              ]
            },
            {
              groupName: strings.SectionsGroupName,
              groupFields: [
                toggle('showAmount', strings.ShowAmountLabel),
                toggle('showChallenges', strings.ShowChallengesLabel),
                toggle('showSolution', strings.ShowSolutionLabel),
                toggle('showUsefulForOthers', strings.ShowUsefulForOthersLabel),
                toggle('showTags', strings.ShowTagsLabel),
                toggle('showGoals', strings.ShowGoalsLabel),
                toggle('showImage', strings.ShowImageLabel),
                toggle('showLocation', strings.ShowLocationLabel),
                toggle('showInspiredBy', strings.ShowInspiredByLabel)
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
