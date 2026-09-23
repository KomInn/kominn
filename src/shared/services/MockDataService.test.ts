import { MockDataService } from './MockDataService';

describe('MockDataService', () => {
  it('filtrerer på status og sorterer på likes', async () => {
    const svc = new MockDataService();
    const published = await svc.getSuggestions({ status: 'Publisert', orderBy: 'likes' });
    expect(published.length).toBeGreaterThan(1);
    expect(published.every((s) => s.status === 'Publisert')).toBe(true);
    expect(published[0].likes).toBeGreaterThanOrEqual(published[1].likes);
  });

  it('returnerer kun mine forslag', async () => {
    const svc = new MockDataService();
    const me = await svc.getCurrentUser();
    const mine = await svc.getSuggestions({ mineOnly: true });
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((s) => s.submitter.id === me.id)).toBe(true);
  });

  it('oppretter forslag og oppdaterer teller ved like og kommentar', async () => {
    const svc = new MockDataService();
    const created = await svc.createSuggestion({
      title: 'Test', summary: 'Sammendrag', focusAreas: ['Grønn mobilitet'], tags: [], submitter: { name: 'Test Person' },
      sustainabilityGoalIds: [13], inspiredByIds: [1]
    });
    expect(created.status).toBe('Sendt inn');
    expect(created.sustainabilityGoals[0].id).toBe(13);
    expect(created.inspiredBy[0].id).toBe(1);

    expect(await svc.toggleLike(created.id)).toBe(1);
    expect(await svc.hasLiked(created.id)).toBe(true);
    expect(await svc.toggleLike(created.id)).toBe(0);

    await svc.addComment(created.id, 'Hei');
    const reloaded = await svc.getSuggestion(created.id);
    expect(reloaded?.numberOfComments).toBe(1);
  });

  it('erstatter egen vurdering i stedet for å legge til ny', async () => {
    const svc = new MockDataService();
    const before = (await svc.getEvaluations(5)).length;
    await svc.saveEvaluation({ suggestionId: 5, feasibility: 3, emissionReductionPotential: 3, distributionPotential: 3, degreeOfInnovation: 3, moreActors: false, lawRequirements: false });
    await svc.saveEvaluation({ suggestionId: 5, feasibility: 5, emissionReductionPotential: 3, distributionPotential: 3, degreeOfInnovation: 3, moreActors: false, lawRequirements: false });
    const after = await svc.getEvaluations(5);
    expect(after.length).toBe(before + 1);
    expect(after[after.length - 1].feasibility).toBe(5);
  });
});

describe('MockDataService – relaterte forslag', () => {
  it('finner forslag som er inspirert av et annet', async () => {
    const svc = new MockDataService();
    const inspired = await svc.getInspiredSuggestions(3);
    expect(inspired.map((s) => s.id)).toEqual([4]);
  });
});
