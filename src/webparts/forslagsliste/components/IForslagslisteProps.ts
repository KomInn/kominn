import type { DisplayMode } from '@microsoft/sp-core-library';
import type { SuggestionOrder } from '../../../shared/services';

/** Hvilke forslag listen viser. Styres fra egenskapsruten. */
export type ListMode = 'published' | 'promoted' | 'success' | 'monthly' | 'mine';
export type ListLayout = 'cards' | 'carousel' | 'compact';
export type ListPeriod = 'all' | 'thisYear' | 'last12Months';

export interface IForslagslisteProps {
  title: string;
  mode: ListMode;
  layout: ListLayout;
  period: ListPeriod;
  /** Antall per side. «Vis flere» henter én side til. */
  top: number;
  defaultOrder: SuggestionOrder;
  showFilters: boolean;
  showSorting: boolean;
  emptyText: string;
  displayMode: DisplayMode;
  onTitleChange: (title: string) => void;
}
