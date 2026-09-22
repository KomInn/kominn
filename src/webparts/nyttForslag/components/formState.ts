import type { NewSuggestion, Person, Suggestion, SuggestionRef } from '../../../shared/models';
import type { NyttForslagSections } from './INyttForslagProps';

export interface FormState {
  title: string;
  summary: string;
  amount: string;
  challenges: string;
  suggestedSolution: string;
  usefulForOthers: string;
  focusAreas: string[];
  tags: string[];
  goalIds: number[];
  imageUrl?: string;
  location?: string;
  inspiredBy: SuggestionRef[];
  name: string;
  email: string;
  department: string;
  telephone: string;
  /** Om personalia er hentet fra profilen (så vi ikke overskriver det brukeren har endret). */
  personaliaFilled: boolean;
}

export const emptyForm: FormState = {
  title: '',
  summary: '',
  amount: '',
  challenges: '',
  suggestedSolution: '',
  usefulForOthers: '',
  focusAreas: [],
  tags: [],
  goalIds: [],
  inspiredBy: [],
  name: '',
  email: '',
  department: '',
  telephone: '',
  personaliaFilled: false
};

export type FormErrors = Partial<Record<keyof FormState, string>>;

export interface ValidationTexts {
  required: string;
  invalidAmount: string;
  invalidEmail: string;
}

export function validate(form: FormState, sections: NyttForslagSections, t: ValidationTexts): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = t.required;
  if (!form.summary.trim()) errors.summary = t.required;
  if (!form.name.trim()) errors.name = t.required;
  if (sections.showAmount) {
    if (!form.amount.trim()) errors.amount = t.required;
    else if (!/^\d+([.,]\d+)?$/.test(form.amount.trim())) errors.amount = t.invalidAmount;
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = t.invalidEmail;
  return errors;
}

export function fillPersonalia(form: FormState, user: Person): FormState {
  if (form.personaliaFilled) return form;
  return {
    ...form,
    name: form.name || user.name,
    email: form.email || user.email || '',
    department: form.department || user.department || '',
    telephone: form.telephone || user.telephone || '',
    personaliaFilled: true
  };
}

/** Forhåndsutfyller skjemaet fra et eksisterende forslag (?kopier=<id>). */
export function fromSuggestion(source: Suggestion, base: FormState): FormState {
  return {
    ...base,
    title: source.title,
    summary: source.summary,
    amount: source.amount !== undefined ? String(source.amount) : '',
    challenges: source.challenges ?? '',
    suggestedSolution: source.suggestedSolution ?? '',
    usefulForOthers: source.usefulForOthers ?? '',
    focusAreas: source.focusAreas,
    tags: source.tags,
    goalIds: source.sustainabilityGoals.map((g) => g.id),
    imageUrl: source.imageUrl,
    location: source.location,
    inspiredBy: [{ id: source.id, title: source.title }]
  };
}

export function toNewSuggestion(form: FormState, user: Person | undefined, imageUrl: string | undefined, competitionRef: string): NewSuggestion {
  const amount = form.amount.trim() ? parseFloat(form.amount.replace(',', '.')) : undefined;
  return {
    title: form.title.trim(),
    summary: form.summary.trim(),
    challenges: form.challenges.trim() || undefined,
    suggestedSolution: form.suggestedSolution.trim() || undefined,
    usefulForOthers: form.usefulForOthers.trim() || undefined,
    amount: amount !== undefined && !isNaN(amount) ? amount : undefined,
    focusAreas: form.focusAreas,
    tags: form.tags,
    imageUrl,
    location: form.location,
    submitter: {
      id: user?.id,
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      department: form.department.trim() || undefined,
      telephone: form.telephone.trim() || undefined,
      loginName: user?.loginName,
      manager: user?.manager
    },
    sustainabilityGoalIds: form.goalIds,
    inspiredByIds: form.inspiredBy.map((s) => s.id),
    competitionRef: competitionRef.trim() || undefined
  };
}
