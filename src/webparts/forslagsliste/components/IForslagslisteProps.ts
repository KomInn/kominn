import type { DisplayMode } from '@microsoft/sp-core-library';
import type { SuggestionOrder } from '../../../shared/services';

/** Hvilke forslag listen viser. Styres fra egenskapsruten. */
export type ListMode = 'published' | 'promoted' | 'success' | 'monthly' | 'mine';
export type ListLayout = 'cards' | 'carousel' | 'compact';
export type ListPeriod = 'all' | 'thisYear' | 'last12Months';
/** Som i SharePoints webdel for uthevet innhold: ingen sideinndeling, eller forrige/neste. */
export type ListPaging = 'none' | 'prevNext';

export const LIST_MODES: ListMode[] = ['published', 'promoted', 'success', 'monthly', 'mine'];

export interface IForslagslisteProps {
  title: string;
  mode: ListMode;
  layout: ListLayout;
  period: ListPeriod;
  /** Antall forslag som vises (per side ved sideinndeling). */
  top: number;
  paging: ListPaging;
  /** Viser lenken «Se alle» ved overskriften. */
  showSeeAll: boolean;
  /** Mål for «Se alle». Tom = siden Alle forslag på KomInn-området, med samme visning. */
  seeAllUrl: string;
  /** Lar ?visning=<modus> i adressen overstyre modus (brukes på siden Alle forslag). */
  modeFromUrl: boolean;
  defaultOrder: SuggestionOrder;
  showFilters: boolean;
  showSorting: boolean;
  showImages: boolean;
  /** Viser månedens forslag først, fremhevet (kun for publiserte forslag). */
  highlightMonthly: boolean;
  emptyText: string;
  displayMode: DisplayMode;
  onTitleChange: (title: string) => void;
}
