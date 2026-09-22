import type { Campaign, Evaluation, Suggestion, SuggestionComment, SustainabilityGoal, Person, SuggestionStatus } from '../models';

export interface SuggestionQuery {
  status?: SuggestionStatus;
  mineOnly?: boolean;
  monthlyOnly?: boolean;
  focusAreas?: string[];
  tags?: string[];
  fromDate?: Date;
  toDate?: Date;
  orderBy?: 'created' | 'likes' | 'comments';
  top?: number;
  skip?: number;
}

/**
 * Eneste inngang mot SharePoint fra webdelene.
 * Implementeres med PnPjs (SharePointDataService) og som mock for lokal utvikling (MockDataService).
 */
export interface IDataService {
  getSuggestions(query: SuggestionQuery): Promise<Suggestion[]>;
  getSuggestion(id: number): Promise<Suggestion | undefined>;
  searchSuggestions(text: string, top?: number): Promise<Suggestion[]>;
  createSuggestion(suggestion: Omit<Suggestion, 'id' | 'created' | 'likes' | 'numberOfComments'>): Promise<Suggestion>;
  updateSuggestion(id: number, changes: Partial<Suggestion>): Promise<void>;
  uploadImage(file: File): Promise<string>;

  getComments(suggestionId: number): Promise<SuggestionComment[]>;
  addComment(suggestionId: number, text: string): Promise<SuggestionComment>;
  toggleLike(suggestionId: number): Promise<number>;

  getEvaluations(suggestionId?: number): Promise<Evaluation[]>;
  saveEvaluation(evaluation: Omit<Evaluation, 'id'>): Promise<Evaluation>;

  getSustainabilityGoals(): Promise<SustainabilityGoal[]>;
  getCampaigns(): Promise<Campaign[]>;
  getConfig(): Promise<Record<string, string>>;

  getCurrentUser(): Promise<Person>;
  isCaseWorker(): Promise<boolean>;
}
