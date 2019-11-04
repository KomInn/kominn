export interface ISuggestionRatingState {
    ScoreFeasability: number;
    ScoreUserInvolvement: number;
    ScoreDistributionPotential: number;
    ScoreDegreeOfInnovation: number;
    MoreActors: boolean;
    LawRequirements: boolean;
    isSaving: boolean;
    ShortComment: string;
    existingId: number;
    isSaved: boolean;
    userHasPermissions: boolean;
}
