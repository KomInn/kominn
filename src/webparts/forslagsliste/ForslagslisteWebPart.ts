import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ForslagslisteWebPartStrings';
import { Forslagsliste } from './components/Forslagsliste';
import type { IForslagslisteProps, ListLayout, ListMode, ListPeriod } from './components/IForslagslisteProps';
import { createDataService, type IDataService, type SuggestionOrder } from '../../shared/services';
import { KomInnProvider } from '../../shared/components';

export interface IForslagslisteWebPartProps {
  title: string;
  mode: ListMode;
  layout: ListLayout;
  period: ListPeriod;
  defaultOrder: SuggestionOrder;
  showFilters: boolean;
  showSorting: boolean;
  /** Absolutt URL til KomInn-området. Tom = området webdelen står på. */
  siteUrl: string;
  top: number;
  emptyText: string;
}

export default class ForslagslisteWebPart extends BaseClientSideWebPart<IForslagslisteWebPartProps> {
  private _service?: IDataService;
  private theme?: IReadonlyTheme;

  /** Datalaget opprettes ved første bruk. SharePoint kan kalle render (via onThemeChanged) før onInit er ferdig. */
  private get service(): IDataService {
    if (!this._service) this._service = createDataService(this.context, { siteUrl: this.properties.siteUrl });
    return this._service;
  }

  public render(): void {
    const p = this.properties;
    const props: IForslagslisteProps = {
      title: p.title,
      mode: p.mode ?? 'published',
      layout: p.layout ?? 'cards',
      period: p.period ?? 'all',
      defaultOrder: p.defaultOrder ?? (p.mode === 'published' || !p.mode ? 'likes' : 'created'),
      showFilters: p.showFilters === true,
      showSorting: p.showSorting === true,
      top: p.top ?? 12,
      emptyText: p.emptyText || strings.DefaultEmptyText,
      displayMode: this.displayMode,
      onTitleChange: (title) => {
        this.properties.title = title;
      }
    };
    ReactDom.render(
      React.createElement(KomInnProvider, { theme: this.theme, instanceId: this.instanceId, service: this.service }, React.createElement(Forslagsliste, props)),
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
                PropertyPaneDropdown('period', {
                  label: strings.PeriodFieldLabel,
                  options: [
                    { key: 'all', text: strings.PeriodAll },
                    { key: 'thisYear', text: strings.PeriodThisYear },
                    { key: 'last12Months', text: strings.PeriodLast12Months }
                  ]
                }),
                PropertyPaneDropdown('defaultOrder', {
                  label: strings.SortLabel,
                  options: [
                    { key: 'likes', text: strings.SortLikes },
                    { key: 'comments', text: strings.SortComments },
                    { key: 'created', text: strings.SortCreated }
                  ]
                }),
                PropertyPaneSlider('top', { label: strings.TopFieldLabel, min: 1, max: 50, step: 1 }),
                PropertyPaneTextField('emptyText', { label: strings.EmptyTextFieldLabel })
              ]
            },
            {
              groupName: strings.LayoutGroupName,
              groupFields: [
                PropertyPaneChoiceGroup('layout', {
                  label: strings.LayoutFieldLabel,
                  options: [
                    { key: 'cards', text: strings.LayoutCards },
                    { key: 'carousel', text: strings.LayoutCarousel },
                    { key: 'compact', text: strings.LayoutCompact }
                  ]
                }),
                PropertyPaneToggle('showFilters', { label: strings.ShowFiltersLabel, onText: 'På', offText: 'Av' }),
                PropertyPaneToggle('showSorting', { label: strings.ShowSortingLabel, onText: 'På', offText: 'Av' })
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
