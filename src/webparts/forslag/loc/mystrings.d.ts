declare interface IForslagWebPartStrings {
  PropertyPaneDescription: string;
  DisplayGroupName: string;
  SourceGroupName: string;
  ShowMapLabel: string;
  ShowCommentsLabel: string;
  ShowRelatedLabel: string;
  ShowEvaluationLabel: string;
  FixedIdLabel: string;
  FixedIdDescription: string;
  SiteUrlFieldLabel: string;
  SiteUrlFieldDescription: string;

  Loading: string;
  NoIdText: string;
  NotFoundText: string;
  LoadErrorTitle: string;
  TypeSuggestion: string;
  TypeSuccess: string;
  TypePast: string;
  ChallengesTitle: string;
  SolutionTitle: string;
  UsefulForOthersTitle: string;
  GoalsTitle: string;
  Like: string;
  Liked: string;
  CommentsShort: string;
  DoThisToo: string;
  DoThisTooHint: string;
  CopyLink: string;
  LinkCopied: string;
  DetailsTitle: string;
  AmountLabel: string;
  StatusLabel: string;
  CaseWorkerStatusLabel: string;
  CaseWorkerLabel: string;
  SubmitterLabel: string;
  EmailLabel: string;
  ManagerLabel: string;
  CompetitionRefLabel: string;
  MapTitle: string;

  RelatedTitle: string;
  RelatedBefore: string;
  RelatedAfter: string;

  CommentsTitle: string;
  CommentsEmpty: string;
  CommentsLoadError: string;
  CommentLabel: string;
  CommentSend: string;
  CommentSending: string;

  CaseWorkerTitle: string;
  CaseWorkerHint: string;
  SaveStatus: string;
  StatusSaved: string;
  AverageTitle: string;
  AverageEmpty: string;
  AverageCount: string;
  MyEvaluationTitle: string;
  ScoreFeasibility: string;
  ScoreEmission: string;
  ScoreDistribution: string;
  ScoreInnovation: string;
  MoreActorsLabel: string;
  LawRequirementsLabel: string;
  EvaluationCommentLabel: string;
  SaveEvaluation: string;
  EvaluationSaved: string;
}

declare module 'ForslagWebPartStrings' {
  const strings: IForslagWebPartStrings;
  export = strings;
}
