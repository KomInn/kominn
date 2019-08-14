import { Suggestion } from "../../Models";
export interface ISendTilKSState {
    selectedSuggestion: Suggestion;
    allSuggestions: Suggestion[];
    message: string;
}
