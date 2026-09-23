import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import type { IList } from '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import '@pnp/sp/files';
import '@pnp/sp/folders';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups/web';
import '@pnp/sp/profiles';
import type { ISPFXContext } from '@pnp/sp';
import type {
  Campaign,
  Evaluation,
  NewEvaluation,
  NewSuggestion,
  Person,
  Suggestion,
  SuggestionComment,
  SustainabilityGoal
} from '../models';
import type { IDataService, SuggestionQuery } from './IDataService';
import {
  CASE_WORKER_GROUP,
  CommentFields,
  ConfigFields,
  EvaluationFields,
  LikeFields,
  Lists,
  SuggestionFields as F
} from './constants';
import { mapCampaign, mapComment, mapEvaluation, mapSuggestion, mapSustainabilityGoal, type ListItem } from './mappers';

const SUGGESTION_SELECT = [
  'Id', 'Title', 'Created',
  F.summary, F.challenges, F.suggestedSolution, F.usefulForOthers, F.amount, F.focusAreas, F.tags, F.image, F.location,
  F.status, F.caseWorkerStatus, F.name, F.email, F.department, F.telephone, F.address, F.zipCode, F.city, F.countyCode,
  F.likes, F.numberOfComments, F.monthlyStartDate, F.monthlyEndDate, F.isPast, F.competitionRef,
  'Author/Id', 'Author/Title', 'Author/EMail',
  `${F.caseWorker}/Id`, `${F.caseWorker}/Title`, `${F.caseWorker}/EMail`,
  `${F.manager}/Id`, `${F.manager}/Title`, `${F.manager}/EMail`,
  `${F.sustainabilityGoals}/Id`, `${F.sustainabilityGoals}/Title`,
  `${F.inspiredBy}/Id`, `${F.inspiredBy}/Title`
];
const SUGGESTION_EXPAND = ['Author', F.caseWorker, F.manager, F.sustainabilityGoals, F.inspiredBy];

function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Datalag mot SharePoint via PnPjs.
 * Kan peke på et annet område enn det webdelen står på (siteUrl), slik at f.eks. intranettet
 * kan liste godkjente forslag fra KomInn-området.
 */
export class SharePointDataService implements IDataService {
  public readonly webUrl: string;
  private readonly sp: SPFI;
  private currentUser?: Promise<Person>;

  constructor(context: ISPFXContext, siteUrl?: string) {
    const url = (siteUrl ?? '').trim().replace(/\/$/, '');
    this.webUrl = url || context.pageContext.web.absoluteUrl;
    this.sp = (url ? spfi(url) : spfi()).using(SPFx(context));
  }

  private list(title: string): IList {
    return this.sp.web.lists.getByTitle(title);
  }

  // ---------- Forslag ----------

  public async getSuggestions(query: SuggestionQuery = {}): Promise<Suggestion[]> {
    const filters: string[] = [];
    if (query.status) filters.push(`${F.status} eq ${odataString(query.status)}`);
    if (query.mineOnly) {
      const me = await this.getCurrentUser();
      filters.push(`Author/Id eq ${me.id}`);
    }
    if (query.monthlyOnly) {
      const now = new Date().toISOString();
      filters.push(`${F.monthlyStartDate} le datetime'${now}' and ${F.monthlyEndDate} ge datetime'${now}'`);
    }
    if (query.fromDate) filters.push(`Created ge datetime'${query.fromDate.toISOString()}'`);
    if (query.toDate) filters.push(`Created le datetime'${query.toDate.toISOString()}'`);
    for (const area of query.focusAreas ?? []) filters.push(`${F.focusAreas} eq ${odataString(area)}`);
    for (const tag of query.tags ?? []) filters.push(`${F.tags} eq ${odataString(tag)}`);

    const orderField = query.orderBy === 'likes' ? F.likes : query.orderBy === 'comments' ? F.numberOfComments : 'Created';
    let q = this.list(Lists.suggestions).items.select(...SUGGESTION_SELECT).expand(...SUGGESTION_EXPAND).orderBy(orderField, false).top(query.top ?? 50);
    if (filters.length) q = q.filter(filters.join(' and '));
    const items: ListItem[] = await q();
    return items.map((i) => mapSuggestion(i, this.webUrl));
  }

  public async getSuggestion(id: number): Promise<Suggestion | undefined> {
    try {
      const item: ListItem = await this.list(Lists.suggestions).items.getById(id).select(...SUGGESTION_SELECT).expand(...SUGGESTION_EXPAND)();
      return mapSuggestion(item, this.webUrl);
    } catch {
      return undefined;
    }
  }

  public async searchSuggestions(text: string, top = 20): Promise<Suggestion[]> {
    const term = text.trim();
    if (!term) return [];
    const items: ListItem[] = await this.list(Lists.suggestions).items
      .select(...SUGGESTION_SELECT).expand(...SUGGESTION_EXPAND)
      .filter(`substringof(${odataString(term)}, Title)`)
      .orderBy('Created', false).top(top)();
    return items.map((i) => mapSuggestion(i, this.webUrl));
  }

  public async getInspiredSuggestions(id: number): Promise<Suggestion[]> {
    const items: ListItem[] = await this.list(Lists.suggestions).items
      .select(...SUGGESTION_SELECT).expand(...SUGGESTION_EXPAND)
      .filter(`${F.inspiredBy}/Id eq ${id}`)
      .orderBy('Created', false).top(20)();
    return items.map((i) => mapSuggestion(i, this.webUrl));
  }

  public async createSuggestion(s: NewSuggestion): Promise<Suggestion> {
    const payload: ListItem = {
      Title: s.title,
      [F.summary]: s.summary,
      [F.challenges]: s.challenges ?? null,
      [F.suggestedSolution]: s.suggestedSolution ?? null,
      [F.usefulForOthers]: s.usefulForOthers ?? null,
      [F.amount]: s.amount ?? null,
      [F.focusAreas]: s.focusAreas,
      [F.tags]: s.tags,
      [F.image]: s.imageUrl ?? null,
      [F.location]: s.location ?? null,
      [F.status]: 'Sendt inn',
      [F.caseWorkerStatus]: 'Sendt inn',
      [F.name]: s.submitter.name,
      [F.email]: s.submitter.email ?? null,
      [F.department]: s.submitter.department ?? null,
      [F.telephone]: s.submitter.telephone ?? null,
      [F.address]: s.submitter.address ?? null,
      [F.zipCode]: s.submitter.zipCode ?? null,
      [F.city]: s.submitter.city ?? null,
      [F.countyCode]: s.submitter.countyCode ?? null,
      [F.competitionRef]: s.competitionRef ?? null,
      [F.likes]: 0,
      [F.numberOfComments]: 0,
      [F.isPast]: false,
      [`${F.sustainabilityGoals}Id`]: s.sustainabilityGoalIds,
      [`${F.inspiredBy}Id`]: s.inspiredByIds
    };
    if (s.submitter.manager?.id) payload[`${F.manager}Id`] = s.submitter.manager.id;
    const added: ListItem = await this.list(Lists.suggestions).items.add(payload);
    const created = await this.getSuggestion(added.Id);
    if (!created) throw new Error('Forslaget ble opprettet, men kunne ikke leses tilbake.');
    return created;
  }

  public async updateSuggestion(id: number, changes: Parameters<IDataService['updateSuggestion']>[1]): Promise<void> {
    const payload: ListItem = {};
    if (changes.status !== undefined) payload[F.status] = changes.status;
    if (changes.caseWorkerStatus !== undefined) payload[F.caseWorkerStatus] = changes.caseWorkerStatus;
    if (changes.caseWorker !== undefined) payload[`${F.caseWorker}Id`] = changes.caseWorker?.id ?? null;
    if (changes.monthlyStartDate !== undefined) payload[F.monthlyStartDate] = changes.monthlyStartDate?.toISOString() ?? null;
    if (changes.monthlyEndDate !== undefined) payload[F.monthlyEndDate] = changes.monthlyEndDate?.toISOString() ?? null;
    if (changes.isPast !== undefined) payload[F.isPast] = changes.isPast;
    if (Object.keys(payload).length === 0) return;
    await this.list(Lists.suggestions).items.getById(id).update(payload);
  }

  public async uploadImage(file: File): Promise<string> {
    const safeName = `${Date.now()}-${file.name.replace(/[^\w.\-æøåÆØÅ]/g, '_')}`;
    const folder = `${new URL(this.webUrl).pathname.replace(/\/$/, '')}/${Lists.images}`;
    const result = await this.sp.web.getFolderByServerRelativePath(folder).files.addUsingPath(safeName, file, { Overwrite: true });
    return `${new URL(this.webUrl).origin}${result.ServerRelativeUrl}`;
  }

  // ---------- Kommentarer og likes ----------

  public async getComments(suggestionId: number): Promise<SuggestionComment[]> {
    const items: ListItem[] = await this.list(Lists.comments).items
      .select('Id', 'Created', CommentFields.text, CommentFields.image, `${CommentFields.suggestion}Id`, 'Author/Id', 'Author/Title', 'Author/EMail')
      .expand('Author')
      .filter(`${CommentFields.suggestion}Id eq ${suggestionId}`)
      .orderBy('Created', true).top(500)();
    return items.map(mapComment);
  }

  public async addComment(suggestionId: number, text: string): Promise<SuggestionComment> {
    const added: ListItem = await this.list(Lists.comments).items.add({
      Title: text.slice(0, 200),
      [CommentFields.text]: text,
      [`${CommentFields.suggestion}Id`]: suggestionId
    });
    const count = await this.list(Lists.comments).items.select('Id').filter(`${CommentFields.suggestion}Id eq ${suggestionId}`).top(5000)();
    await this.list(Lists.suggestions).items.getById(suggestionId).update({ [F.numberOfComments]: count.length });
    const me = await this.getCurrentUser();
    return { id: added.Id, suggestionId, text, author: me, created: new Date() };
  }

  private async myLike(suggestionId: number): Promise<ListItem | undefined> {
    const me = await this.getCurrentUser();
    const items: ListItem[] = await this.list(Lists.likes).items.select('Id')
      .filter(`${LikeFields.suggestion}Id eq ${suggestionId} and Author/Id eq ${me.id}`).top(1)();
    return items[0];
  }

  public async hasLiked(suggestionId: number): Promise<boolean> {
    return !!(await this.myLike(suggestionId));
  }

  public async toggleLike(suggestionId: number): Promise<number> {
    const existing = await this.myLike(suggestionId);
    if (existing) {
      await this.list(Lists.likes).items.getById(existing.Id).delete();
    } else {
      await this.list(Lists.likes).items.add({ Title: String(suggestionId), [`${LikeFields.suggestion}Id`]: suggestionId });
    }
    const all = await this.list(Lists.likes).items.select('Id').filter(`${LikeFields.suggestion}Id eq ${suggestionId}`).top(5000)();
    await this.list(Lists.suggestions).items.getById(suggestionId).update({ [F.likes]: all.length });
    return all.length;
  }

  // ---------- Vurdering ----------

  public async getEvaluations(suggestionId?: number): Promise<Evaluation[]> {
    let q = this.list(Lists.evaluations).items
      .select('Id', 'Created', `${EvaluationFields.suggestion}Id`, EvaluationFields.feasibility, EvaluationFields.emissionReductionPotential,
        EvaluationFields.distributionPotential, EvaluationFields.degreeOfInnovation, EvaluationFields.moreActors, EvaluationFields.lawRequirements,
        EvaluationFields.comment, 'Author/Id', 'Author/Title', 'Author/EMail')
      .expand('Author').top(5000);
    if (suggestionId) q = q.filter(`${EvaluationFields.suggestion}Id eq ${suggestionId}`);
    const items: ListItem[] = await q();
    return items.map(mapEvaluation);
  }

  public async saveEvaluation(e: NewEvaluation): Promise<Evaluation> {
    const me = await this.getCurrentUser();
    const payload: ListItem = {
      Title: `Vurdering ${e.suggestionId}`,
      [`${EvaluationFields.suggestion}Id`]: e.suggestionId,
      [EvaluationFields.feasibility]: e.feasibility,
      [EvaluationFields.emissionReductionPotential]: e.emissionReductionPotential,
      [EvaluationFields.distributionPotential]: e.distributionPotential,
      [EvaluationFields.degreeOfInnovation]: e.degreeOfInnovation,
      [EvaluationFields.moreActors]: e.moreActors,
      [EvaluationFields.lawRequirements]: e.lawRequirements,
      [EvaluationFields.comment]: e.comment ?? null
    };
    const mine = (await this.getEvaluations(e.suggestionId)).filter((x) => x.author?.id === me.id);
    if (mine.length) {
      await this.list(Lists.evaluations).items.getById(mine[0].id).update(payload);
      return { ...e, id: mine[0].id, author: me, created: mine[0].created };
    }
    const added: ListItem = await this.list(Lists.evaluations).items.add(payload);
    return { ...e, id: added.Id, author: me, created: new Date() };
  }

  // ---------- Oppslag ----------

  public async getSustainabilityGoals(): Promise<SustainabilityGoal[]> {
    const items: ListItem[] = await this.list(Lists.sustainabilityGoals).items.select('Id', 'Title', 'KmiIconFileName').orderBy('ID', true).top(50)();
    return items.map((i) => mapSustainabilityGoal(i, this.webUrl));
  }

  public async getCampaigns(): Promise<Campaign[]> {
    const items: ListItem[] = await this.list(Lists.campaigns).items.select('Id', 'Title', 'KmiCampaignType', 'KmiCampaignText', 'KmiCampaignStartDate', 'KmiCampaignEndDate', 'KmiCampaignRef', 'KmiCampaignPlacement').top(100)();
    return items.map(mapCampaign);
  }

  public async getConfig(): Promise<Record<string, string>> {
    try {
      const items: ListItem[] = await this.list(Lists.config).items.select(ConfigFields.key, ConfigFields.value).top(500)();
      const config: Record<string, string> = {};
      for (const i of items) if (i[ConfigFields.key]) config[i[ConfigFields.key]] = i[ConfigFields.value] ?? '';
      return config;
    } catch {
      return {};
    }
  }

  public async getChoices(fieldInternalName: string): Promise<string[]> {
    const field: { Choices?: string[] } = await this.list(Lists.suggestions).fields.getByInternalNameOrTitle(fieldInternalName).select('Choices')();
    return field.Choices ?? [];
  }

  // ---------- Bruker ----------

  public getCurrentUser(): Promise<Person> {
    if (!this.currentUser) this.currentUser = this.loadCurrentUser();
    return this.currentUser;
  }

  private async loadCurrentUser(): Promise<Person> {
    const user = await this.sp.web.currentUser();
    const person: Person = { id: user.Id, name: user.Title, email: user.Email, loginName: user.LoginName };
    try {
      const profile = await this.sp.profiles.myProperties();
      const props = new Map<string, string>();
      for (const p of profile.UserProfileProperties ?? []) props.set(p.Key, p.Value);
      person.department = props.get('Department') || undefined;
      person.telephone = props.get('WorkPhone') || props.get('CellPhone') || undefined;
      person.address = props.get('Office') || undefined;
      const managerLogin = props.get('Manager');
      if (managerLogin) {
        try {
          const manager = await this.sp.web.ensureUser(managerLogin);
          person.manager = { id: manager.Id, name: manager.Title, email: manager.Email, loginName: manager.LoginName };
        } catch {
          person.manager = { name: managerLogin, loginName: managerLogin };
        }
      }
    } catch {
      // Profiltjenesten er ikke kritisk. Brukeren kan fylle ut manuelt.
    }
    return person;
  }

  public async getCaseWorkers(): Promise<Person[]> {
    try {
      const users: { Id: number; Title: string; Email: string; LoginName: string; PrincipalType: number }[] =
        await this.sp.web.siteGroups.getByName(CASE_WORKER_GROUP).users.select('Id', 'Title', 'Email', 'LoginName', 'PrincipalType')();
      return users.filter((u) => u.PrincipalType === 1).map((u) => ({ id: u.Id, name: u.Title, email: u.Email, loginName: u.LoginName }));
    } catch {
      return [];
    }
  }

  public async isCaseWorker(): Promise<boolean> {
    try {
      const groups: { Title: string }[] = await this.sp.web.currentUser.groups.select('Title')();
      return groups.some((g) => g.Title === CASE_WORKER_GROUP);
    } catch {
      return false;
    }
  }
}
