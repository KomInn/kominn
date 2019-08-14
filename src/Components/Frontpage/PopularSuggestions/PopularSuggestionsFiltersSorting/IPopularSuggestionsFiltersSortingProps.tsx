import { PopularSuggestionsSortTypes } from './PopularSuggestionsSortTypes';

export interface IPopularSuggestionsFiltersSortingProps extends React.HTMLProps<HTMLDivElement> {
    onSort: (sorting: PopularSuggestionsSortTypes) => void;
}
