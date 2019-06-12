import { Suggestion } from "../../Common/Suggestion";
import { PopularSuggestionsSortTypes } from "./PopularSuggestionsSortTypes";
import { PopularSuggestionsFilter } from "./PopularSuggestionsFilter";
export interface IPopularSuggestionsState {
    suggestions: Array<Suggestion>;
    top?: number;
    maxReached?: boolean;
    sorting?: PopularSuggestionsSortTypes;
    filter?: Array<PopularSuggestionsFilter>;
    showSorting?: boolean;
    showFilter?: boolean;
    filterValues: Array<PopularSuggestionsFilter>;
}
