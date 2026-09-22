import type { Campaign, Evaluation, Person, Suggestion, SuggestionComment, SustainabilityGoal, SuggestionStatus, CaseWorkerStatus, CampaignType } from '../models';
import { Lists, SUGGESTION_PAGE, SUGGESTION_QUERY_KEY } from './constants';

/** Rå listeelementer slik PnPjs (odata=nometadata) returnerer dem. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ListItem = Record<string, any>;

export interface UserValue {
  Id?: number;
  Title?: string;
  EMail?: string;
  Name?: string;
}

export function suggestionUrl(webUrl: string, id: number): string {
  return `${webUrl.replace(/\/$/, '')}/${SUGGESTION_PAGE}?${SUGGESTION_QUERY_KEY}=${id}`;
}

export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? undefined : d;
}

export function toStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string');
  if (typeof value === 'string') return value.split(/;#|;/).map((s) => s.trim()).filter(Boolean);
  return [];
}

export function toPerson(value?: UserValue): Person | undefined {
  if (!value || (!value.Title && !value.EMail)) return undefined;
  return { id: value.Id, name: value.Title ?? value.EMail ?? '', email: value.EMail, loginName: value.Name };
}

export function mapSustainabilityGoal(item: ListItem, webUrl: string): SustainabilityGoal {
  const file = item.KmiIconFileName as string | undefined;
  return {
    id: item.Id,
    title: item.Title ?? '',
    iconUrl: file ? `${webUrl.replace(/\/$/, '')}/${Lists.icons}/${file}` : undefined
  };
}

export function mapSuggestion(item: ListItem, webUrl: string): Suggestion {
  const goals = (item.KmiSustainabilityGoals as ListItem[] | undefined) ?? [];
  const inspired = (item.KmiInspiredBy as ListItem[] | undefined) ?? [];
  const author = toPerson(item.Author);
  const submitter: Person = {
    id: author?.id,
    name: item.KmiName || author?.name || '',
    email: item.KmiMailAddress || author?.email,
    department: item.KmiDepartment || undefined,
    telephone: item.KmiTelephone || undefined,
    address: item.KmiAddress || undefined,
    zipCode: item.KmiZipcode || undefined,
    city: item.KmiCity || undefined,
    countyCode: item.KmiCountyCode || undefined,
    manager: toPerson(item.KmiManager)
  };
  return {
    id: item.Id,
    title: item.Title ?? '',
    summary: item.KmiSummary ?? '',
    challenges: item.KmiChallenges || undefined,
    suggestedSolution: item.KmiSuggestedSolution || undefined,
    usefulForOthers: item.KmiUsefulForOthers || undefined,
    amount: typeof item.KmiAmount === 'number' ? item.KmiAmount : undefined,
    focusAreas: toStringArray(item.KmiUsefulnessType),
    tags: toStringArray(item.KmiTags),
    imageUrl: item.KmiImage || undefined,
    location: item.KmiLocation || undefined,
    status: (item.KmiStatus as SuggestionStatus) ?? 'Sendt inn',
    caseWorkerStatus: (item.KmiCaseWorkerStatus as CaseWorkerStatus) ?? 'Sendt inn',
    caseWorker: toPerson(item.KmiCaseWorker),
    submitter,
    sustainabilityGoals: goals.map((g) => ({ id: g.Id, title: g.Title ?? '' })),
    inspiredBy: inspired.map((s) => ({ id: s.Id, title: s.Title ?? '' })),
    likes: item.KmiLikes ?? 0,
    numberOfComments: item.KmiNumberOfComments ?? 0,
    monthlyStartDate: toDate(item.KmiMonthlyStartDate),
    monthlyEndDate: toDate(item.KmiMonthlyEndDate),
    isPast: item.KmiIsPast === true,
    competitionRef: item.KmiCompRef || undefined,
    created: toDate(item.Created) ?? new Date(0),
    url: suggestionUrl(webUrl, item.Id)
  };
}

export function mapComment(item: ListItem): SuggestionComment {
  return {
    id: item.Id,
    suggestionId: item.KmiSuggestionId ?? item.KmiSuggestion?.Id ?? 0,
    text: item.KmiText ?? '',
    author: toPerson(item.Author) ?? { name: '' },
    created: toDate(item.Created) ?? new Date(0),
    imageUrl: item.KmiImage || undefined
  };
}

export function mapEvaluation(item: ListItem): Evaluation {
  return {
    id: item.Id,
    suggestionId: item.KmiSuggestionId ?? item.KmiSuggestion?.Id ?? 0,
    feasibility: item.KmiScoreFeasability ?? 0,
    emissionReductionPotential: item.KmiScoreUserInvolvement ?? 0,
    distributionPotential: item.KmiScoreDistributionPotential ?? 0,
    degreeOfInnovation: item.KmiScoreDegreeOfInnovation ?? 0,
    moreActors: item.KmiMoreActors === true,
    lawRequirements: item.KmiLawRequirements === true,
    comment: item.KmiShortComment || undefined,
    author: toPerson(item.Author),
    created: toDate(item.Created)
  };
}

export function mapCampaign(item: ListItem): Campaign {
  return {
    id: item.Id,
    title: item.Title ?? '',
    type: (item.KmiCampaignType as CampaignType) ?? 'Standard',
    text: item.KmiCampaignText || undefined,
    startDate: toDate(item.KmiCampaignStartDate),
    endDate: toDate(item.KmiCampaignEndDate),
    ref: item.KmiCampaignRef || undefined,
    placement: typeof item.KmiCampaignPlacement === 'number' ? item.KmiCampaignPlacement : undefined
  };
}

/** Snitt av alle vurderinger per forslag. */
export interface EvaluationAverage {
  suggestionId: number;
  count: number;
  feasibility: number;
  emissionReductionPotential: number;
  distributionPotential: number;
  degreeOfInnovation: number;
}

export function averageEvaluations(evaluations: Evaluation[]): EvaluationAverage[] {
  const groups = new Map<number, Evaluation[]>();
  for (const e of evaluations) {
    const list = groups.get(e.suggestionId) ?? [];
    list.push(e);
    groups.set(e.suggestionId, list);
  }
  const avg = (list: Evaluation[], pick: (e: Evaluation) => number): number =>
    Math.round((list.reduce((sum, e) => sum + pick(e), 0) / list.length) * 10) / 10;
  const result: EvaluationAverage[] = [];
  groups.forEach((list, suggestionId) => {
    result.push({
      suggestionId,
      count: list.length,
      feasibility: avg(list, (e) => e.feasibility),
      emissionReductionPotential: avg(list, (e) => e.emissionReductionPotential),
      distributionPotential: avg(list, (e) => e.distributionPotential),
      degreeOfInnovation: avg(list, (e) => e.degreeOfInnovation)
    });
  });
  return result;
}
