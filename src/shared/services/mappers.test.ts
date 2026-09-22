import { averageEvaluations, mapSuggestion, mapSustainabilityGoal, suggestionUrl, toStringArray } from './mappers';

const web = 'https://contoso.sharepoint.com/sites/kominn/';

describe('mapSuggestion', () => {
  it('mapper et listeelement til Suggestion', () => {
    const s = mapSuggestion(
      {
        Id: 42, Title: 'Solceller', KmiSummary: 'Tak', KmiAmount: 1000, KmiUsefulnessType: ['Grønn mobilitet', 'Klimasmart mat'], KmiTags: 'Skole',
        KmiStatus: 'Publisert', KmiCaseWorkerStatus: 'Vurderes', KmiLikes: 3, KmiNumberOfComments: 1, KmiIsPast: false,
        Created: '2026-01-15T10:00:00Z', Author: { Id: 7, Title: 'Kari', EMail: 'kari@asker.no' }, KmiName: '',
        KmiSustainabilityGoals: [{ Id: 7, Title: 'Mål 7' }], KmiInspiredBy: [{ Id: 3, Title: 'Sykkel' }],
        KmiCaseWorker: { Id: 20, Title: 'Saks', EMail: 'saks@asker.no' }, KmiManager: null
      },
      web
    );
    expect(s.id).toBe(42);
    expect(s.focusAreas).toEqual(['Grønn mobilitet', 'Klimasmart mat']);
    expect(s.tags).toEqual(['Skole']);
    expect(s.submitter.name).toBe('Kari');
    expect(s.submitter.manager).toBeUndefined();
    expect(s.caseWorker?.id).toBe(20);
    expect(s.sustainabilityGoals).toEqual([{ id: 7, title: 'Mål 7' }]);
    expect(s.inspiredBy[0].title).toBe('Sykkel');
    expect(s.created.getUTCFullYear()).toBe(2026);
    expect(s.url).toBe('https://contoso.sharepoint.com/sites/kominn/SitePages/Forslag.aspx?forslag=42');
  });

  it('bruker standardverdier når felt mangler', () => {
    const s = mapSuggestion({ Id: 1 }, web);
    expect(s.status).toBe('Sendt inn');
    expect(s.likes).toBe(0);
    expect(s.focusAreas).toEqual([]);
    expect(s.submitter.name).toBe('');
  });
});

describe('hjelpefunksjoner', () => {
  it('toStringArray håndterer array, streng og tomt', () => {
    expect(toStringArray(['a', 'b'])).toEqual(['a', 'b']);
    expect(toStringArray('a;#b')).toEqual(['a', 'b']);
    expect(toStringArray(undefined)).toEqual([]);
  });

  it('suggestionUrl fjerner dobbel skråstrek', () => {
    expect(suggestionUrl(web, 5)).toBe('https://contoso.sharepoint.com/sites/kominn/SitePages/Forslag.aspx?forslag=5');
  });

  it('mapSustainabilityGoal bygger ikon-URL fra filnavn', () => {
    const g = mapSustainabilityGoal({ Id: 13, Title: 'Mål 13', KmiIconFileName: 'Goal-13.png' }, web);
    expect(g.iconUrl).toBe('https://contoso.sharepoint.com/sites/kominn/Ikoner/Goal-13.png');
  });
});

describe('averageEvaluations', () => {
  it('beregner snitt per forslag', () => {
    const avg = averageEvaluations([
      { id: 1, suggestionId: 1, feasibility: 4, emissionReductionPotential: 5, distributionPotential: 3, degreeOfInnovation: 2, moreActors: true, lawRequirements: false },
      { id: 2, suggestionId: 1, feasibility: 3, emissionReductionPotential: 4, distributionPotential: 4, degreeOfInnovation: 2, moreActors: true, lawRequirements: false },
      { id: 3, suggestionId: 2, feasibility: 5, emissionReductionPotential: 3, distributionPotential: 5, degreeOfInnovation: 3, moreActors: false, lawRequirements: false }
    ]);
    expect(avg).toHaveLength(2);
    const first = avg.find((a) => a.suggestionId === 1);
    expect(first?.count).toBe(2);
    expect(first?.feasibility).toBe(3.5);
    expect(first?.emissionReductionPotential).toBe(4.5);
  });
});
