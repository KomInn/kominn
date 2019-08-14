import { Suggestion } from "../../Models";

export interface INewSuggestionState {
    suggestion: Suggestion;
    formInvalid: boolean;
    submitted?: boolean;
}
