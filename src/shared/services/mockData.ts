import type { Campaign, Evaluation, Person, Suggestion, SuggestionComment, SustainabilityGoal } from '../models';

export const MOCK_WEB_URL = 'https://mock.sharepoint.com/sites/kominn';

export const mockUser: Person = {
  id: 7,
  name: 'Kari Nordmann',
  email: 'kari.nordmann@asker.kommune.no',
  loginName: 'i:0#.f|membership|kari.nordmann@asker.kommune.no',
  department: 'Klima og miljø',
  telephone: '66 70 00 00',
  manager: { id: 12, name: 'Ola Leder', email: 'ola.leder@asker.kommune.no' }
};

const goalTitles = [
  'Mål 1 - Utrydde fattigdom', 'Mål 2 - Utrydde sult', 'Mål 3 - God helse', 'Mål 4 - God utdanning',
  'Mål 5 - Likestilling mellom kjønnene', 'Mål 6 - Rent vann og gode sanitærforhold', 'Mål 7 - Ren energi for alle',
  'Mål 8 - Anstendig arbeid og økonomisk vekst', 'Mål 9 - Innovasjon og infrastruktur', 'Mål 10 - Mindre ulikhet',
  'Mål 11 - Bærekraftige byer og samfunn', 'Mål 12 - Ansvarlig forbruk og produksjon', 'Mål 13 - Stoppe klimaendringene',
  'Mål 14 - Liv under vann', 'Mål 15 - Liv på land', 'Mål 16 - Fred og rettferdighet', 'Mål 17 - Samarbeid for å nå målene'
];

export const mockGoals: SustainabilityGoal[] = goalTitles.map((title, i) => ({
  id: i + 1,
  title,
  iconUrl: `${MOCK_WEB_URL}/Ikoner/Goal-${String(i + 1).padStart(2, '0')}.png`
}));

const goal = (id: number): SustainabilityGoal => ({ id: mockGoals[id - 1].id, title: mockGoals[id - 1].title });
const daysAgo = (n: number): Date => new Date(Date.now() - n * 86400000);

export const mockSuggestions: Suggestion[] = [
  {
    id: 1, title: 'Solceller på Risenga svømmehall', summary: 'Montere solcelleanlegg på taket for å dekke deler av strømforbruket til varmepumpene.',
    challenges: 'Høyt energiforbruk til oppvarming av basseng.', amount: 450000, focusAreas: ['Fremtidsrettede bygg og anlegg'], tags: ['Kommunalt'],
    location: '59.8272,10.4394', status: 'Publisert', caseWorkerStatus: 'Vurderes', submitter: mockUser,
    sustainabilityGoals: [goal(7), goal(13)], inspiredBy: [], likes: 14, numberOfComments: 3, isPast: false, created: daysAgo(12),
    url: `${MOCK_WEB_URL}/SitePages/Forslag.aspx?forslag=1`
  },
  {
    id: 2, title: 'Klimasmart meny i skolekantinene', summary: 'Én vegetarisk dag i uken og lokale råvarer i alle kommunale kantiner.',
    challenges: 'Kjøttbasert meny gir høye utslipp.', amount: 80000, focusAreas: ['Klimasmart mat'], tags: ['Skole'],
    status: 'Publisert', caseWorkerStatus: 'Godtatt', submitter: { id: 8, name: 'Per Hansen', email: 'per.hansen@asker.kommune.no', department: 'Oppvekst' },
    sustainabilityGoals: [goal(2), goal(12)], inspiredBy: [], likes: 27, numberOfComments: 8, isPast: false, created: daysAgo(30),
    monthlyStartDate: daysAgo(5), monthlyEndDate: new Date(Date.now() + 25 * 86400000),
    url: `${MOCK_WEB_URL}/SitePages/Forslag.aspx?forslag=2`
  },
  {
    id: 3, title: 'Sykkelparkering under tak ved alle rådhusinnganger', summary: 'Trygg og tørr sykkelparkering med ladepunkt for el-sykler.',
    amount: 120000, focusAreas: ['Grønn mobilitet'], tags: ['Kommunalt'], location: '59.8340,10.4350',
    status: 'Suksess', caseWorkerStatus: 'Godtatt', submitter: { id: 9, name: 'Anne Berg', email: 'anne.berg@asker.kommune.no', department: 'Eiendom' },
    sustainabilityGoals: [goal(11), goal(3)], inspiredBy: [], likes: 41, numberOfComments: 12, isPast: false, created: daysAgo(200),
    url: `${MOCK_WEB_URL}/SitePages/Forslag.aspx?forslag=3`
  },
  {
    id: 4, title: 'Gjenbrukslager for kontormøbler', summary: 'Felles lager der virksomheter kan hente og levere brukte møbler før nykjøp.',
    amount: 60000, focusAreas: ['Bærekraftig forbruk'], tags: ['Kommunalt'],
    status: 'Promotert', caseWorkerStatus: 'Godtatt', submitter: mockUser,
    sustainabilityGoals: [goal(12)], inspiredBy: [{ id: 3, title: 'Sykkelparkering under tak ved alle rådhusinnganger' }], likes: 19, numberOfComments: 4, isPast: false, created: daysAgo(45),
    url: `${MOCK_WEB_URL}/SitePages/Forslag.aspx?forslag=4`
  },
  {
    id: 5, title: 'Skogplanting på kommunal tomt i Heggedal', summary: 'Plante 2 000 trær som karbonlager og turområde.',
    amount: 95000, focusAreas: ['Naturen som karbonlager'], tags: ['Kommunalt'], location: '59.7833,10.4500',
    status: 'Sendt inn', caseWorkerStatus: 'Sendt inn', submitter: { id: 10, name: 'Lars Vik', email: 'lars.vik@asker.kommune.no', department: 'Natur og idrett' },
    sustainabilityGoals: [goal(15), goal(13)], inspiredBy: [], likes: 2, numberOfComments: 0, isPast: false, created: daysAgo(2),
    url: `${MOCK_WEB_URL}/SitePages/Forslag.aspx?forslag=5`
  },
  {
    id: 6, title: 'LED-belysning i alle barnehager', summary: 'Gjennomført i 2021. Byttet all lysarmatur til LED med bevegelsessensor.',
    focusAreas: ['Fremtidsrettede bygg og anlegg'], tags: ['Barnehage'],
    status: 'Suksess', caseWorkerStatus: 'Godtatt', submitter: { id: 11, name: 'Eva Lund', department: 'Eiendom' },
    sustainabilityGoals: [goal(7)], inspiredBy: [], likes: 33, numberOfComments: 5, isPast: true, created: daysAgo(900),
    url: `${MOCK_WEB_URL}/SitePages/Forslag.aspx?forslag=6`
  }
];

export const mockComments: SuggestionComment[] = [
  { id: 1, suggestionId: 1, text: 'Flott forslag! Har dere sjekket bæreevnen på taket?', author: { id: 8, name: 'Per Hansen' }, created: daysAgo(10) },
  { id: 2, suggestionId: 1, text: 'Ja, det ble vurdert i 2023 og er dimensjonert for det.', author: mockUser, created: daysAgo(9) },
  { id: 3, suggestionId: 1, text: 'Kan dette kombineres med batteri?', author: { id: 9, name: 'Anne Berg' }, created: daysAgo(4) },
  { id: 4, suggestionId: 2, text: 'Elevrådet på Hovedgården er positive.', author: { id: 10, name: 'Lars Vik' }, created: daysAgo(20) }
];

export const mockEvaluations: Evaluation[] = [
  { id: 1, suggestionId: 1, feasibility: 4, emissionReductionPotential: 5, distributionPotential: 3, degreeOfInnovation: 2, moreActors: true, lawRequirements: false, comment: 'Solid, men dyrt.', author: { id: 20, name: 'Saks Behandler' }, created: daysAgo(8) },
  { id: 2, suggestionId: 1, feasibility: 3, emissionReductionPotential: 4, distributionPotential: 4, degreeOfInnovation: 2, moreActors: true, lawRequirements: false, author: { id: 21, name: 'Vurd Erer' }, created: daysAgo(7) },
  { id: 3, suggestionId: 2, feasibility: 5, emissionReductionPotential: 3, distributionPotential: 5, degreeOfInnovation: 3, moreActors: false, lawRequirements: false, author: { id: 20, name: 'Saks Behandler' }, created: daysAgo(25) }
];

export const mockCampaigns: Campaign[] = [
  { id: 1, title: 'Internt klimatilskudd 2026', type: 'Kampanje', text: 'Søk om midler til klimatiltak i din virksomhet. Frist 1. november.', startDate: daysAgo(60), endDate: new Date(Date.now() + 40 * 86400000), ref: 'KLIMA2026', placement: 1 },
  { id: 2, title: 'Standardtekst', type: 'Standard', text: 'Har du en idé som gjør Asker bedre? Send inn et forslag.', placement: 2 }
];

export const mockConfig: Record<string, string> = {
  KART_SENTER: '59.8331,10.4392',
  KART_ZOOM: '11'
};

export const mockChoices: Record<string, string[]> = {
  KmiUsefulnessType: ['Endring, ledelse og kommunikasjon', 'Klimasmart mat', 'Bærekraftig forbruk', 'Fremtidsrettede bygg og anlegg', 'Grønn mobilitet', 'Naturen som karbonlager'],
  KmiTags: ['Kommunalt', 'Skole', 'Barnehage'],
  KmiStatus: ['Sendt inn', 'Publisert', 'Suksess', 'Promotert'],
  KmiCaseWorkerStatus: ['Sendt inn', 'Løftes til linja', 'Vurderes', 'Godtatt', 'Avslått']
};
