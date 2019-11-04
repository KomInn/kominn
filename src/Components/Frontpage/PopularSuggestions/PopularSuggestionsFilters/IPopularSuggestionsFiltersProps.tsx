import { PopularSuggestionsFilter } from './PopularSuggestionsFilter';

export interface IPopularSuggestionsFiltersProps extends React.HTMLProps<HTMLDivElement> {
    filters: PopularSuggestionsFilter[];
    onChanged: (filter: PopularSuggestionsFilter) => void;
}
