export interface IForslagProps {
  /** Id fra ?forslag=<id>, eller fast id satt i egenskapsruten. */
  suggestionId?: number;
  showMap: boolean;
  showEvaluation: boolean;
  showComments: boolean;
  showRelated: boolean;
}
