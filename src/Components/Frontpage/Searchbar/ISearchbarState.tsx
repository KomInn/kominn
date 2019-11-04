import { Suggestion } from "../../../Models";

export interface ISearchbarState {
    inspiredBy: Suggestion[];
    suggestions: Suggestion[];
    searchTerm?: string;
    showSuggestions?: boolean;
}
