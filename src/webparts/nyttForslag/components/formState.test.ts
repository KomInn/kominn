import { emptyForm, fillPersonalia, fromSuggestion, toNewSuggestion, validate } from './formState';
import type { NyttForslagSections } from './INyttForslagProps';
import { mockSuggestions, mockUser } from '../../../shared/services/mockData';

const sections: NyttForslagSections = {
  showAmount: true, showChallenges: true, showSolution: true, showUsefulForOthers: true, showTags: true,
  showGoals: true, showImage: true, showLocation: true, showInspiredBy: true
};
const t = { required: 'Må fylles ut', invalidAmount: 'Ugyldig sum', invalidEmail: 'Ugyldig e-post' };

describe('validate', () => {
  it('krever tittel, beskrivelse, navn og sum', () => {
    const errors = validate(emptyForm, sections, t);
    expect(Object.keys(errors).sort()).toEqual(['amount', 'name', 'summary', 'title']);
  });
  it('krever ikke sum når seksjonen er skjult', () => {
    const errors = validate({ ...emptyForm, title: 'a', summary: 'b', name: 'c' }, { ...sections, showAmount: false }, t);
    expect(errors).toEqual({});
  });
  it('avviser ugyldig sum og e-post', () => {
    const errors = validate({ ...emptyForm, title: 'a', summary: 'b', name: 'c', amount: '12abc', email: 'feil' }, sections, t);
    expect(errors.amount).toBe(t.invalidAmount);
    expect(errors.email).toBe(t.invalidEmail);
  });
});

describe('fillPersonalia', () => {
  it('fyller fra profil én gang og bevarer brukerens egne endringer', () => {
    const filled = fillPersonalia(emptyForm, mockUser);
    expect(filled.name).toBe(mockUser.name);
    expect(filled.personaliaFilled).toBe(true);
    const edited = { ...filled, name: 'Endret' };
    expect(fillPersonalia(edited, mockUser).name).toBe('Endret');
  });
});

describe('fromSuggestion og toNewSuggestion', () => {
  it('kopierer innhold og setter inspirert av', () => {
    const form = fromSuggestion(mockSuggestions[0], emptyForm);
    expect(form.title).toBe(mockSuggestions[0].title);
    expect(form.inspiredBy).toEqual([{ id: 1, title: mockSuggestions[0].title }]);
    expect(form.goalIds).toEqual([7, 13]);
  });
  it('bygger NewSuggestion med tall og leder', () => {
    const form = { ...fillPersonalia(emptyForm, mockUser), title: 'T', summary: 'S', amount: '1 500'.replace(' ', ''), goalIds: [1] };
    const s = toNewSuggestion(form, mockUser, 'https://x/bilde.jpg', 'REF');
    expect(s.amount).toBe(1500);
    expect(s.submitter.manager?.name).toBe('Ola Leder');
    expect(s.imageUrl).toBe('https://x/bilde.jpg');
    expect(s.competitionRef).toBe('REF');
    expect(s.sustainabilityGoalIds).toEqual([1]);
  });
});
