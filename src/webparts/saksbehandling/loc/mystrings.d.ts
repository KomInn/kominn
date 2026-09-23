declare interface ISaksbehandlingWebPartStrings {
  PropertyPaneDescription: string;
  DefaultFilterGroupName: string;
  SourceGroupName: string;
  MaxItemsLabel: string;
  SiteUrlFieldLabel: string;
  SiteUrlFieldDescription: string;

  Loading: string;
  NoAccessTitle: string;
  NoAccessText: string;
  LoadErrorTitle: string;
  CountsLabel: string;
  SearchLabel: string;
  SearchPlaceholder: string;
  AllStatuses: string;
  MineOnly: string;
  Refresh: string;
  ShowingCount: string;
  TableLabel: string;
  ColTitle: string;
  ColCreated: string;
  ColSubmitter: string;
  ColCaseWorkerStatus: string;
  ColStatus: string;
  ColCaseWorker: string;
  ColScore: string;
  ColLikes: string;
  ColActions: string;
  Handle: string;
  NoRows: string;
  Unassigned: string;

  Close: string;
  OpenSuggestion: string;
  StatusLabel: string;
  StatusHint: string;
  CaseWorkerStatusLabel: string;
  CaseWorkerLabel: string;
  AssignToMe: string;
  EvaluationTitle: string;
  EvaluationCount: string;
  NoEvaluations: string;
  EvaluateHint: string;
  ScoreFeasibility: string;
  ScoreEmission: string;
  ScoreDistribution: string;
  ScoreInnovation: string;
  Save: string;
  Cancel: string;
}

declare module 'SaksbehandlingWebPartStrings' {
  const strings: ISaksbehandlingWebPartStrings;
  export = strings;
}
