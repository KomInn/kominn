import { clearDraft, loadDraft, saveDraft } from './draft';

describe('draft', () => {
  it('lagrer, leser og sletter', () => {
    saveDraft('t', { a: 1 });
    expect(loadDraft<{ a: number }>('t')).toEqual({ a: 1 });
    clearDraft('t');
    expect(loadDraft('t')).toBeUndefined();
  });
});
