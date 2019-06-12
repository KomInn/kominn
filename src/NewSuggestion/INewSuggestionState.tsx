import { Suggestion } from "../Components/Common";
export interface INewSuggestionState {
    suggestion: Suggestion;
    formInvalid: boolean;
    submitted?: boolean;
}
