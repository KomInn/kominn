/**
 * Felles domenemodeller for KomInn 2.0.
 * Feltnavnene speiler listene i provisioning/template.xml (prefiks Kmi i SharePoint).
 */

/** KmiStatus på listen Forslag. */
export type SuggestionStatus = 'Sendt inn' | 'Publisert' | 'Suksess' | 'Promotert';
export const SUGGESTION_STATUSES: SuggestionStatus[] = ['Sendt inn', 'Publisert', 'Suksess', 'Promotert'];

/** KmiCaseWorkerStatus på listen Forslag. */
export type CaseWorkerStatus = 'Sendt inn' | 'Løftes til linja' | 'Vurderes' | 'Godtatt' | 'Avslått';
export const CASE_WORKER_STATUSES: CaseWorkerStatus[] = ['Sendt inn', 'Løftes til linja', 'Vurderes', 'Godtatt', 'Avslått'];

/** KmiCampaignType på listen Kampanje. */
export type CampaignType = 'Standard' | 'Kampanje' | 'Fortid';

export interface Person {
  id?: number;
  name: string;
  email?: string;
  loginName?: string;
  department?: string;
  telephone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  countyCode?: string;
  /** Nærmeste leder (KmiManager). */
  manager?: Person;
}

export interface SustainabilityGoal {
  id: number;
  title: string;
  iconUrl?: string;
}

export interface SuggestionRef {
  id: number;
  title: string;
}

export interface Suggestion {
  id: number;
  title: string;
  summary: string;
  challenges?: string;
  suggestedSolution?: string;
  usefulForOthers?: string;
  /** Søkt sum (KmiAmount). */
  amount?: number;
  /** Innsatsområder (KmiUsefulnessType). */
  focusAreas: string[];
  tags: string[];
  imageUrl?: string;
  /** Sted som "lat,lng" (KmiLocation). */
  location?: string;
  status: SuggestionStatus;
  caseWorkerStatus: CaseWorkerStatus;
  caseWorker?: Person;
  submitter: Person;
  sustainabilityGoals: SustainabilityGoal[];
  inspiredBy: SuggestionRef[];
  likes: number;
  numberOfComments: number;
  monthlyStartDate?: Date;
  monthlyEndDate?: Date;
  isPast: boolean;
  competitionRef?: string;
  created: Date;
  /** Absolutt adresse til forslagssiden. */
  url: string;
}

/** Feltene brukeren fyller ut når et forslag sendes inn. */
export type NewSuggestion = Pick<
  Suggestion,
  'title' | 'summary' | 'challenges' | 'suggestedSolution' | 'usefulForOthers' | 'amount' | 'focusAreas' | 'tags' | 'imageUrl' | 'location' | 'submitter'
> & {
  sustainabilityGoalIds: number[];
  inspiredByIds: number[];
  competitionRef?: string;
};

export interface SuggestionComment {
  id: number;
  suggestionId: number;
  text: string;
  author: Person;
  created: Date;
  imageUrl?: string;
}

/** Én vurdering fra én saksbehandler (listen Forslagsvurdering). Score 1–5. */
export interface Evaluation {
  id: number;
  suggestionId: number;
  feasibility: number;
  emissionReductionPotential: number;
  distributionPotential: number;
  degreeOfInnovation: number;
  moreActors: boolean;
  lawRequirements: boolean;
  comment?: string;
  author?: Person;
  created?: Date;
}

export type NewEvaluation = Omit<Evaluation, 'id' | 'author' | 'created'>;

export interface Campaign {
  id: number;
  title: string;
  type: CampaignType;
  text?: string;
  startDate?: Date;
  endDate?: Date;
  ref?: string;
  placement?: number;
}
