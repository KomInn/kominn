import type { CaseWorkerStatus, Suggestion } from '../../../shared/models';
import type { EvaluationAverage } from '../../../shared/services';

export interface CaseRow {
  suggestion: Suggestion;
  average?: EvaluationAverage;
  /** Snitt av de fire kriteriene, eller undefined uten vurderinger. */
  score?: number;
}

export type SortKey = 'created' | 'title' | 'caseWorkerStatus' | 'score' | 'likes';
export interface SortState {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

export interface CaseFilter {
  text: string;
  statuses: CaseWorkerStatus[];
  mineOnly: boolean;
  currentUserId?: number;
}

export function overallScore(a?: EvaluationAverage): number | undefined {
  if (!a || a.count === 0) return undefined;
  return Math.round(((a.feasibility + a.emissionReductionPotential + a.distributionPotential + a.degreeOfInnovation) / 4) * 10) / 10;
}

export function buildRows(suggestions: Suggestion[], averages: EvaluationAverage[]): CaseRow[] {
  const byId = new Map(averages.map((a) => [a.suggestionId, a]));
  return suggestions.map((s) => {
    const average = byId.get(s.id);
    return { suggestion: s, average, score: overallScore(average) };
  });
}

export function filterRows(rows: CaseRow[], f: CaseFilter): CaseRow[] {
  const term = f.text.trim().toLowerCase();
  return rows.filter(({ suggestion: s }) => {
    if (f.statuses.length && !f.statuses.includes(s.caseWorkerStatus)) return false;
    if (f.mineOnly && s.caseWorker?.id !== f.currentUserId) return false;
    if (term && !`${s.title} ${s.submitter.name} ${s.submitter.department ?? ''}`.toLowerCase().includes(term)) return false;
    return true;
  });
}

const statusOrder: CaseWorkerStatus[] = ['Sendt inn', 'Løftes til linja', 'Vurderes', 'Godtatt', 'Avslått'];

export function sortRows(rows: CaseRow[], sort: SortState): CaseRow[] {
  const dir = sort.direction === 'ascending' ? 1 : -1;
  const value = (r: CaseRow): number | string => {
    switch (sort.key) {
      case 'title':
        return r.suggestion.title.toLowerCase();
      case 'caseWorkerStatus':
        return statusOrder.indexOf(r.suggestion.caseWorkerStatus);
      case 'score':
        return r.score ?? -1;
      case 'likes':
        return r.suggestion.likes;
      default:
        return r.suggestion.created.getTime();
    }
  };
  return [...rows].sort((a, b) => {
    const va = value(a);
    const vb = value(b);
    return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
  });
}

export function countByStatus(rows: CaseRow[]): Record<CaseWorkerStatus, number> {
  const counts = { 'Sendt inn': 0, 'Løftes til linja': 0, Vurderes: 0, Godtatt: 0, Avslått: 0 } as Record<CaseWorkerStatus, number>;
  for (const r of rows) counts[r.suggestion.caseWorkerStatus] += 1;
  return counts;
}
