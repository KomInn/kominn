import type { Person, SustainabilityGoal } from '../models';
import { SuggestionFields } from '../services';
import { useAsync, type AsyncState } from './useAsync';
import { useDataService } from './useDataService';

export function useCurrentUser(): AsyncState<Person> {
  const service = useDataService();
  return useAsync(() => service.getCurrentUser(), [service]);
}

export function useSustainabilityGoals(): AsyncState<SustainabilityGoal[]> {
  const service = useDataService();
  return useAsync(() => service.getSustainabilityGoals(), [service]);
}

export function useChoices(field: string): AsyncState<string[]> {
  const service = useDataService();
  return useAsync(() => service.getChoices(field), [service, field]);
}

export function useFocusAreas(): AsyncState<string[]> {
  return useChoices(SuggestionFields.focusAreas);
}

export function useTags(): AsyncState<string[]> {
  return useChoices(SuggestionFields.tags);
}

export function useConfig(): AsyncState<Record<string, string>> {
  const service = useDataService();
  return useAsync(() => service.getConfig(), [service]);
}

export function useIsCaseWorker(): AsyncState<boolean> {
  const service = useDataService();
  return useAsync(() => service.isCaseWorker(), [service]);
}
