/** Listetitler slik de provisjoneres i provisioning/template.xml. */
export const Lists = {
  suggestions: 'Forslag',
  evaluations: 'Forslagsvurdering',
  campaigns: 'Kampanje',
  comments: 'Kommentarer',
  likes: 'Likes',
  sustainabilityGoals: 'Baerekraftsmaal',
  icons: 'Ikoner',
  images: 'Bilder',
  config: 'Konfigurasjon'
} as const;

/** SharePoint-gruppen som gir saksbehandlerrettigheter. */
export const CASE_WORKER_GROUP = 'Saksbehandlere';

/** Relativ sti til siden som viser ett forslag. Forslags-id sendes som ?forslag=<id>. */
export const SUGGESTION_PAGE = 'SitePages/Forslag.aspx';
export const SUGGESTION_QUERY_KEY = 'forslag';

/** Interne feltnavn på listen Forslag. */
export const SuggestionFields = {
  title: 'Title',
  summary: 'KmiSummary',
  challenges: 'KmiChallenges',
  suggestedSolution: 'KmiSuggestedSolution',
  usefulForOthers: 'KmiUsefulForOthers',
  amount: 'KmiAmount',
  focusAreas: 'KmiUsefulnessType',
  tags: 'KmiTags',
  image: 'KmiImage',
  location: 'KmiLocation',
  status: 'KmiStatus',
  caseWorkerStatus: 'KmiCaseWorkerStatus',
  caseWorker: 'KmiCaseWorker',
  name: 'KmiName',
  email: 'KmiMailAddress',
  department: 'KmiDepartment',
  telephone: 'KmiTelephone',
  address: 'KmiAddress',
  zipCode: 'KmiZipcode',
  city: 'KmiCity',
  countyCode: 'KmiCountyCode',
  manager: 'KmiManager',
  sustainabilityGoals: 'KmiSustainabilityGoals',
  inspiredBy: 'KmiInspiredBy',
  likes: 'KmiLikes',
  numberOfComments: 'KmiNumberOfComments',
  monthlyStartDate: 'KmiMonthlyStartDate',
  monthlyEndDate: 'KmiMonthlyEndDate',
  isPast: 'KmiIsPast',
  competitionRef: 'KmiCompRef'
} as const;

export const EvaluationFields = {
  suggestion: 'KmiSuggestion',
  feasibility: 'KmiScoreFeasability',
  emissionReductionPotential: 'KmiScoreUserInvolvement',
  distributionPotential: 'KmiScoreDistributionPotential',
  degreeOfInnovation: 'KmiScoreDegreeOfInnovation',
  moreActors: 'KmiMoreActors',
  lawRequirements: 'KmiLawRequirements',
  comment: 'KmiShortComment'
} as const;

export const CommentFields = { suggestion: 'KmiSuggestion', text: 'KmiText', image: 'KmiImage' } as const;
export const LikeFields = { suggestion: 'KmiSuggestion' } as const;
export const GoalFields = { iconFileName: 'KmiIconFileName' } as const;
export const ConfigFields = { key: 'KmiKey', value: 'KmiValue' } as const;
export const CampaignFields = {
  type: 'KmiCampaignType',
  text: 'KmiCampaignText',
  startDate: 'KmiCampaignStartDate',
  endDate: 'KmiCampaignEndDate',
  ref: 'KmiCampaignRef',
  placement: 'KmiCampaignPlacement'
} as const;
