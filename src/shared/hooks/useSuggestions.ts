import type { Suggestion } from '../models';
import type { SuggestionQuery } from '../services';
import { useAsync, type AsyncState } from './useAsync';
import { useDataService } from './useDataService';

/** Henter forslag. Med query undefined gjøres ingen kall, og resultatet er en tom liste. */
export function useSuggestions(query: SuggestionQuery | undefined): AsyncState<Suggestion[]> {
  const service = useDataService();
  return useAsync(async () => (query ? service.getSuggestions(query) : []), [service, JSON.stringify(query ?? null)]);
}

export function useInspiredSuggestions(id: number | undefined): AsyncState<Suggestion[]> {
  const service = useDataService();
  return useAsync(async () => (id ? service.getInspiredSuggestions(id) : []), [service, id]);
}

export function useSuggestion(id: number | undefined): AsyncState<Suggestion | undefined> {
  const service = useDataService();
  return useAsync(async () => (id ? service.getSuggestion(id) : undefined), [service, id]);
}
