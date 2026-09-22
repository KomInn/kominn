import type { Suggestion } from '../models';
import type { SuggestionQuery } from '../services';
import { useAsync, type AsyncState } from './useAsync';
import { useDataService } from './useDataService';

export function useSuggestions(query: SuggestionQuery): AsyncState<Suggestion[]> {
  const service = useDataService();
  return useAsync(() => service.getSuggestions(query), [service, JSON.stringify(query)]);
}

export function useSuggestion(id: number | undefined): AsyncState<Suggestion | undefined> {
  const service = useDataService();
  return useAsync(async () => (id ? service.getSuggestion(id) : undefined), [service, id]);
}
