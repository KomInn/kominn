import { buildQuery, periodRange } from './listQuery';

const now = new Date(2026, 8, 22, 12, 0, 0);
const none = { focusAreas: [], tags: [], orderBy: 'created' as const };

describe('periodRange', () => {
  it('inneværende år', () => {
    const r = periodRange('thisYear', now);
    expect(r.fromDate?.getFullYear()).toBe(2026);
    expect(r.fromDate?.getMonth()).toBe(0);
    expect(r.toDate?.getMonth()).toBe(11);
  });
  it('siste tolv måneder', () => {
    expect(periodRange('last12Months', now).fromDate?.getFullYear()).toBe(2025);
  });
  it('alle', () => {
    expect(periodRange('all', now)).toEqual({});
  });
});

describe('buildQuery', () => {
  it('publiserte med filtre', () => {
    const q = buildQuery('published', 'all', { focusAreas: ['Klimasmart mat'], tags: [], orderBy: 'likes' }, 12, now);
    expect(q).toMatchObject({ status: 'Publisert', focusAreas: ['Klimasmart mat'], orderBy: 'likes', top: 12 });
    expect(q.tags).toBeUndefined();
  });
  it('modusene gir riktig status eller flagg', () => {
    expect(buildQuery('promoted', 'all', none, 5, now).status).toBe('Promotert');
    expect(buildQuery('success', 'all', none, 5, now).status).toBe('Suksess');
    expect(buildQuery('monthly', 'all', none, 5, now).monthlyOnly).toBe(true);
    const mine = buildQuery('mine', 'all', none, 5, now);
    expect(mine.mineOnly).toBe(true);
    expect(mine.status).toBeUndefined();
  });
});
