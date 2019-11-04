import { Suggestion } from "../../../Models";
import { PopularSuggestionsSortTypes } from "./PopularSuggestionsFiltersSorting/PopularSuggestionsSortTypes";
import { PopularSuggestionsFilter } from "./PopularSuggestionsFilters/PopularSuggestionsFilter";
export interface IPopularSuggestionsState {
    suggestions: Suggestion[];
    top?: number;
    maxReached?: boolean;
    sorting?: PopularSuggestionsSortTypes;
    filter?: Array<PopularSuggestionsFilter>;
    showSorting?: boolean;
    showFilter?: boolean;
    filterValues: Array<PopularSuggestionsFilter>;
}
