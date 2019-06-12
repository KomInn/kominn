import { Suggestion } from "../../Common/Suggestion";
export interface ISearchbarState {
    inspiredBy: Suggestion[];
    suggestions: Suggestion[];
    searchTerm?: string;
    showSuggestions?: boolean;
}
