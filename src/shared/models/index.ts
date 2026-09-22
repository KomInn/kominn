/**
 * Felles domenemodeller for KomInn 2.0.
 * Feltnavn speiler listene i provisjoneringsmalen (prefiks Kmi i SharePoint).
 */

/** KmiStatus på listen Forslag. */
export type SuggestionStatus = 'Sendt inn' | 'Publisert' | 'Suksess' | 'Promotert';

/** KmiCaseWorkerStatus på listen Forslag. */
export type CaseWorkerStatus = 'Sendt inn' | 'Løftes til linja' | 'Vurderes' | 'Godtatt' | 'Avslått';

/** KmiCampaignType på listen Kampanje. */
export type CampaignType = 'Standard' | 'Kampanje' | 'Fortid';

export interface Person {
  id?: number;
  name: string;
  email?: string;
  department?: string;
  telephone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  countyCode?: string;
  /** Nærmeste leder, KmiManager. */
  manager?: Person;
}

export interface SustainabilityGoal {
  id: number;
  title: string;
  iconUrl?: string;
}

export interface Suggestion {
  id: number;
  title: string;
  summary: string;
  challenges?: string;
  suggestedSolution?: string;
  usefulForOthers?: string;
  /** KmiAmount / KmiApplyingFor. */
  amount?: number;
  /** KmiUsefulnessType – innsatsområder. */
  focusAreas: string[];
  tags: string[];
  imageUrl?: string;
  /** KmiLocation som "lat,lng". */
  location?: string;
  status: SuggestionStatus;
  caseWorkerStatus: CaseWorkerStatus;
  caseWorker?: Person;
  submitter: Person;
  sustainabilityGoals: SustainabilityGoal[];
  inspiredBy: Pick<Suggestion, 'id' | 'title'>[];
  likes: number;
  numberOfComments: number;
  monthlyStartDate?: Date;
  monthlyEndDate?: Date;
  isPast: boolean;
  competitionRef?: string;
  created: Date;
}

export interface SuggestionComment {
  id: number;
  suggestionId: number;
  text: string;
  author: Person;
  created: Date;
  imageUrl?: string;
}

/** Én vurdering fra én saksbehandler (listen Forslagsvurdering). */
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
}

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
