import * as React from 'react';
import { PopularSuggestionsFilter } from './PopularSuggestionsFilter';
import { Toggle } from "office-ui-fabric-react/lib/Toggle";
import { IPopularSuggestionsFiltersProps } from './IPopularSuggestionsFiltersProps';
import { IPopularSuggestionsFiltersState } from './IPopularSuggestionsFiltersState';
import "./PopularSuggestionsFilters.module.scss";

export default class PopularSuggestionsFilters extends React.Component<IPopularSuggestionsFiltersProps, IPopularSuggestionsFiltersState> {
    public render(): React.ReactElement<IPopularSuggestionsFiltersProps> {
        var tags = this.props.filters.filter((val: PopularSuggestionsFilter) => val.Type === "Tags");
        var usefulness = this.props.filters.filter((val: PopularSuggestionsFilter) => val.Type === "UsefulnessType");
        return (
            <div className="ms-Grid PopularSuggestionsFilters" hidden={this.props.hidden}>
                <div className="ms-Grid-row">
                    <h3>Kategori</h3>
                    {tags.map((filter, idx) => this.renderFilter(`Tag_${idx}`, filter))}
                </div>
                <div className="ms-Grid-row">
                    <h3>Nytteverdi</h3>
                    {usefulness.map((filter, idx) => this.renderFilter(`Usefulness_${idx}`, filter))}
                </div>
            </div>
        )
    }

    private renderFilter(key: string, filter: PopularSuggestionsFilter) {
        return (
            <div key={key} className="ms-Grid-col ms-sm6">
                <Toggle label={filter.Value} onChange={_ => this.props.onChanged(filter)} />
            </div>
        );
    }
}
