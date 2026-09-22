import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneChoiceGroup, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ForslagslisteWebPartStrings';
import { Forslagsliste } from './components/Forslagsliste';
import type { IForslagslisteProps, ListMode } from './components/IForslagslisteProps';
import { createDataService, type IDataService } from '../../shared/services';
import { DataServiceProvider } from '../../shared/hooks';

export interface IForslagslisteWebPartProps {
  title: string;
  mode: ListMode;
  /** Absolutt URL til KomInn-området. Tom = området webdelen står på. */
  siteUrl: string;
  top: number;
  emptyText: string;
}

export default class ForslagslisteWebPart extends BaseClientSideWebPart<IForslagslisteWebPartProps> {
  private service!: IDataService;
  private isDarkTheme = false;

  protected async onInit(): Promise<void> {
    this.service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
  }

  public render(): void {
    const props: IForslagslisteProps = {
      title: this.properties.title,
      mode: this.properties.mode ?? 'published',
      top: this.properties.top ?? 12,
      emptyText: this.properties.emptyText || strings.DefaultEmptyText,
      isDarkTheme: this.isDarkTheme,
      displayMode: this.displayMode,
      onTitleChange: (title) => {
        this.properties.title = title;
      }
    };
    ReactDom.render(React.createElement(DataServiceProvider, { service: this.service }, React.createElement(Forslagsliste, props)), this.domElement);
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    if (propertyPath === 'siteUrl') this.service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) return;
    this.isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;
    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }
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
              groupName: strings.ContentGroupName,
              groupFields: [
                PropertyPaneChoiceGroup('mode', {
                  label: strings.ModeFieldLabel,
                  options: [
                    { key: 'published', text: strings.ModePublished },
                    { key: 'promoted', text: strings.ModePromoted },
                    { key: 'success', text: strings.ModeSuccess },
                    { key: 'monthly', text: strings.ModeMonthly },
                    { key: 'mine', text: strings.ModeMine }
                  ]
                }),
                PropertyPaneSlider('top', { label: strings.TopFieldLabel, min: 1, max: 50, step: 1 }),
                PropertyPaneTextField('emptyText', { label: strings.EmptyTextFieldLabel })
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
