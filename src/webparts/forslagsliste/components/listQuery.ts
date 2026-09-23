import type { SuggestionOrder, SuggestionQuery } from '../../../shared/services';
import type { ListMode, ListPeriod } from './IForslagslisteProps';

export interface ListFilters {
  focusAreas: string[];
  tags: string[];
  orderBy: SuggestionOrder;
}

export function periodRange(period: ListPeriod, now: Date = new Date()): { fromDate?: Date; toDate?: Date } {
  switch (period) {
    case 'thisYear':
      return { fromDate: new Date(now.getFullYear(), 0, 1), toDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59) };
    case 'last12Months': {
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      return { fromDate: from };
    }
    default:
      return {};
  }
}

/** Bygger spørringen for valgt modus, periode, filtre og antall. */
export function buildQuery(mode: ListMode, period: ListPeriod, filters: ListFilters, top: number, now: Date = new Date()): SuggestionQuery {
  const base: SuggestionQuery = {
    ...periodRange(period, now),
    focusAreas: filters.focusAreas.length ? filters.focusAreas : undefined,
    tags: filters.tags.length ? filters.tags : undefined,
    orderBy: filters.orderBy,
    top
  };
  switch (mode) {
    case 'promoted':
      return { ...base, status: 'Promotert' };
    case 'success':
      return { ...base, status: 'Suksess' };
    case 'monthly':
      return { ...base, monthlyOnly: true };
    case 'mine':
      return { ...base, mineOnly: true };
    default:
      return { ...base, status: 'Publisert' };
  }
}
