import { buildRows, countByStatus, filterRows, overallScore, sortRows } from './caseWork';
import { averageEvaluations } from '../../../shared/services/mappers';
import { mockEvaluations, mockSuggestions } from '../../../shared/services/mockData';

const rows = buildRows(mockSuggestions, averageEvaluations(mockEvaluations));

describe('caseWork', () => {
  it('beregner samlet score', () => {
    expect(overallScore(undefined)).toBeUndefined();
    const r1 = rows.find((r) => r.suggestion.id === 1);
    expect(r1?.average?.count).toBe(2);
    expect(r1?.score).toBe(3.4);
  });

  it('filtrerer på status, tekst og mine', () => {
    expect(filterRows(rows, { text: '', statuses: ['Sendt inn'], mineOnly: false }).map((r) => r.suggestion.id)).toEqual([5]);
    expect(filterRows(rows, { text: 'kantin', statuses: [], mineOnly: false }).map((r) => r.suggestion.id)).toEqual([2]);
    expect(filterRows(rows, { text: '', statuses: [], mineOnly: true, currentUserId: 999 })).toHaveLength(0);
  });

  it('sorterer på score synkende med uvurderte sist', () => {
    const sorted = sortRows(rows, { key: 'score', direction: 'descending' });
    expect(sorted[0].suggestion.id).toBe(2);
    expect(sorted[sorted.length - 1].score).toBeUndefined();
  });

  it('teller per saksbehandlerstatus', () => {
    const c = countByStatus(rows);
    expect(c.Godtatt).toBe(4);
    expect(c['Sendt inn']).toBe(1);
  });
});
