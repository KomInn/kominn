import type {
  Campaign,
  Evaluation,
  NewEvaluation,
  NewSuggestion,
  Person,
  Suggestion,
  SuggestionComment,
  SuggestionStatus,
  SustainabilityGoal
} from '../models';

export type SuggestionOrder = 'created' | 'likes' | 'comments';

export interface SuggestionQuery {
  /** Filtrer på KmiStatus. */
  status?: SuggestionStatus;
  /** Kun forslag sendt inn av innlogget bruker. */
  mineOnly?: boolean;
  /** Kun forslag der dagens dato er innenfor månedens-forslag-perioden. */
  monthlyOnly?: boolean;
  focusAreas?: string[];
  tags?: string[];
  fromDate?: Date;
  toDate?: Date;
  orderBy?: SuggestionOrder;
  /** Maks antall. Standard 50. */
  top?: number;
}

/**
 * Eneste inngang mot SharePoint fra webdelene.
 * Implementert av SharePointDataService (PnPjs) og MockDataService (lokal utvikling).
 */
export interface IDataService {
  /** Absolutt URL til området dataene hentes fra. */
  readonly webUrl: string;

  getSuggestions(query?: SuggestionQuery): Promise<Suggestion[]>;
  getSuggestion(id: number): Promise<Suggestion | undefined>;
  searchSuggestions(text: string, top?: number): Promise<Suggestion[]>;
  createSuggestion(suggestion: NewSuggestion): Promise<Suggestion>;
  updateSuggestion(id: number, changes: Partial<Pick<Suggestion, 'status' | 'caseWorkerStatus' | 'caseWorker' | 'monthlyStartDate' | 'monthlyEndDate' | 'isPast'>>): Promise<void>;
  uploadImage(file: File): Promise<string>;

  getComments(suggestionId: number): Promise<SuggestionComment[]>;
  addComment(suggestionId: number, text: string): Promise<SuggestionComment>;
  hasLiked(suggestionId: number): Promise<boolean>;
  /** Legger til eller fjerner innlogget brukers like. Returnerer nytt antall. */
  toggleLike(suggestionId: number): Promise<number>;

  getEvaluations(suggestionId?: number): Promise<Evaluation[]>;
  saveEvaluation(evaluation: NewEvaluation): Promise<Evaluation>;

  getSustainabilityGoals(): Promise<SustainabilityGoal[]>;
  getCampaigns(): Promise<Campaign[]>;
  getConfig(): Promise<Record<string, string>>;
  getChoices(fieldInternalName: string): Promise<string[]>;

  getCurrentUser(): Promise<Person>;
  isCaseWorker(): Promise<boolean>;
}
