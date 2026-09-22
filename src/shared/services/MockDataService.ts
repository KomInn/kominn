import type { Campaign, Evaluation, NewEvaluation, NewSuggestion, Person, Suggestion, SuggestionComment, SustainabilityGoal } from '../models';
import type { IDataService, SuggestionQuery } from './IDataService';
import { suggestionUrl } from './mappers';
import { MOCK_WEB_URL, mockCampaigns, mockChoices, mockComments, mockConfig, mockEvaluations, mockGoals, mockSuggestions, mockUser } from './mockData';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v), (_k, val) => (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val) ? new Date(val) : val));
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Datalag i minnet for lokal utvikling og tester. Aktiveres med ?kominnMock=1 i workbench.
 */
export class MockDataService implements IDataService {
  public readonly webUrl = MOCK_WEB_URL;
  private suggestions: Suggestion[] = clone(mockSuggestions);
  private comments: SuggestionComment[] = clone(mockComments);
  private evaluations: Evaluation[] = clone(mockEvaluations);
  private likedBy = new Map<number, Set<number>>([[1, new Set([8, 9])], [2, new Set([7])]]);
  private readonly latency: number;
  private readonly user: Person;
  private readonly caseWorker: boolean;

  constructor(options: { latencyMs?: number; user?: Person; isCaseWorker?: boolean } = {}) {
    this.latency = options.latencyMs ?? 0;
    this.user = options.user ?? mockUser;
    this.caseWorker = options.isCaseWorker ?? true;
  }

  private async wait(): Promise<void> {
    if (this.latency) await delay(this.latency);
  }

  public async getSuggestions(query: SuggestionQuery = {}): Promise<Suggestion[]> {
    await this.wait();
    const now = Date.now();
    let result = this.suggestions.filter((s) => {
      if (query.status && s.status !== query.status) return false;
      if (query.mineOnly && s.submitter.id !== this.user.id) return false;
      if (query.monthlyOnly && !(s.monthlyStartDate && s.monthlyEndDate && s.monthlyStartDate.getTime() <= now && s.monthlyEndDate.getTime() >= now)) return false;
      if (query.fromDate && s.created < query.fromDate) return false;
      if (query.toDate && s.created > query.toDate) return false;
      if (query.focusAreas?.length && !query.focusAreas.every((a) => s.focusAreas.includes(a))) return false;
      if (query.tags?.length && !query.tags.every((t) => s.tags.includes(t))) return false;
      return true;
    });
    const key = query.orderBy === 'likes' ? (s: Suggestion) => s.likes : query.orderBy === 'comments' ? (s: Suggestion) => s.numberOfComments : (s: Suggestion) => s.created.getTime();
    result = result.sort((a, b) => key(b) - key(a)).slice(0, query.top ?? 50);
    return clone(result);
  }

  public async getSuggestion(id: number): Promise<Suggestion | undefined> {
    await this.wait();
    const s = this.suggestions.find((x) => x.id === id);
    return s ? clone(s) : undefined;
  }

  public async searchSuggestions(text: string, top = 20): Promise<Suggestion[]> {
    await this.wait();
    const term = text.trim().toLowerCase();
    if (!term) return [];
    return clone(this.suggestions.filter((s) => s.title.toLowerCase().includes(term)).slice(0, top));
  }

  public async createSuggestion(s: NewSuggestion): Promise<Suggestion> {
    await this.wait();
    const id = Math.max(0, ...this.suggestions.map((x) => x.id)) + 1;
    const created: Suggestion = {
      id,
      title: s.title,
      summary: s.summary,
      challenges: s.challenges,
      suggestedSolution: s.suggestedSolution,
      usefulForOthers: s.usefulForOthers,
      amount: s.amount,
      focusAreas: s.focusAreas,
      tags: s.tags,
      imageUrl: s.imageUrl,
      location: s.location,
      status: 'Sendt inn',
      caseWorkerStatus: 'Sendt inn',
      submitter: s.submitter,
      sustainabilityGoals: mockGoals.filter((g) => s.sustainabilityGoalIds.includes(g.id)).map((g) => ({ id: g.id, title: g.title })),
      inspiredBy: this.suggestions.filter((x) => s.inspiredByIds.includes(x.id)).map((x) => ({ id: x.id, title: x.title })),
      likes: 0,
      numberOfComments: 0,
      isPast: false,
      competitionRef: s.competitionRef,
      created: new Date(),
      url: suggestionUrl(this.webUrl, id)
    };
    this.suggestions.push(created);
    return clone(created);
  }

  public async updateSuggestion(id: number, changes: Parameters<IDataService['updateSuggestion']>[1]): Promise<void> {
    await this.wait();
    const s = this.suggestions.find((x) => x.id === id);
    if (!s) throw new Error(`Forslag ${id} finnes ikke.`);
    Object.assign(s, changes);
  }

  public async uploadImage(file: File): Promise<string> {
    await this.wait();
    return `${this.webUrl}/Bilder/${encodeURIComponent(file.name)}`;
  }

  public async getComments(suggestionId: number): Promise<SuggestionComment[]> {
    await this.wait();
    return clone(this.comments.filter((c) => c.suggestionId === suggestionId).sort((a, b) => a.created.getTime() - b.created.getTime()));
  }

  public async addComment(suggestionId: number, text: string): Promise<SuggestionComment> {
    await this.wait();
    const comment: SuggestionComment = { id: this.comments.length + 1, suggestionId, text, author: this.user, created: new Date() };
    this.comments.push(comment);
    const s = this.suggestions.find((x) => x.id === suggestionId);
    if (s) s.numberOfComments = this.comments.filter((c) => c.suggestionId === suggestionId).length;
    return clone(comment);
  }

  public async hasLiked(suggestionId: number): Promise<boolean> {
    await this.wait();
    return this.likedBy.get(suggestionId)?.has(this.user.id ?? -1) ?? false;
  }

  public async toggleLike(suggestionId: number): Promise<number> {
    await this.wait();
    const set = this.likedBy.get(suggestionId) ?? new Set<number>();
    const uid = this.user.id ?? -1;
    if (set.has(uid)) set.delete(uid); else set.add(uid);
    this.likedBy.set(suggestionId, set);
    const s = this.suggestions.find((x) => x.id === suggestionId);
    if (!s) throw new Error(`Forslag ${suggestionId} finnes ikke.`);
    s.likes = set.size;
    return s.likes;
  }

  public async getEvaluations(suggestionId?: number): Promise<Evaluation[]> {
    await this.wait();
    return clone(suggestionId ? this.evaluations.filter((e) => e.suggestionId === suggestionId) : this.evaluations);
  }

  public async saveEvaluation(e: NewEvaluation): Promise<Evaluation> {
    await this.wait();
    const existing = this.evaluations.find((x) => x.suggestionId === e.suggestionId && x.author?.id === this.user.id);
    if (existing) {
      Object.assign(existing, e);
      return clone(existing);
    }
    const saved: Evaluation = { ...e, id: this.evaluations.length + 1, author: this.user, created: new Date() };
    this.evaluations.push(saved);
    return clone(saved);
  }

  public async getSustainabilityGoals(): Promise<SustainabilityGoal[]> {
    await this.wait();
    return clone(mockGoals);
  }

  public async getCampaigns(): Promise<Campaign[]> {
    await this.wait();
    return clone(mockCampaigns);
  }

  public async getConfig(): Promise<Record<string, string>> {
    await this.wait();
    return { ...mockConfig };
  }

  public async getChoices(fieldInternalName: string): Promise<string[]> {
    await this.wait();
    return [...(mockChoices[fieldInternalName] ?? [])];
  }

  public async getCurrentUser(): Promise<Person> {
    await this.wait();
    return clone(this.user);
  }

  public async isCaseWorker(): Promise<boolean> {
    await this.wait();
    return this.caseWorker;
  }
}
