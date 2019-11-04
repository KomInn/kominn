import * as React from 'react';
import { PopularSuggestionsSortTypes } from './PopularSuggestionsSortTypes';
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { IPopularSuggestionsFiltersSortingProps } from './IPopularSuggestionsFiltersSortingProps';

export default class PopularSuggestionsFiltersSorting extends React.Component<IPopularSuggestionsFiltersSortingProps, {}> {
    private _sortOptions: IDropdownOption[] = [
        { key: "DateDesc", text: "Dato nyest - eldst", data: { sorting: PopularSuggestionsSortTypes.DateDesc, iconName: 'SortDown' } },
        { key: "DateAsc", text: "Dato eldst - nyest", data: { sorting: PopularSuggestionsSortTypes.DateAsc, iconName: 'SortUp' } }
    ];

    public render(): React.ReactElement<IPopularSuggestionsFiltersSortingProps> {
        return (
            <div className="sorting" hidden={this.props.hidden}>
                <div style={{ width: 200, margin: "0 auto 15px auto" }}>
                    <Dropdown
                        onChange={(_, option) => this.props.onSort(option.data.sorting)}
                        defaultSelectedKey="DateDesc"
                        options={this._sortOptions}
                        onRenderTitle={this._onRenderTitle.bind(this)}
                        onRenderOption={this._onRenderOption.bind(this)} />
                </div>
            </div >
        );
    }

    private _onRenderTitle(options: IDropdownOption[]) {
        const option = options[0];
        return (
            <div>
                {option.data && option.data.iconName && (
                    <Icon style={{ marginRight: '8px' }} iconName={option.data.iconName} aria-hidden="true" title={option.data.text} />
                )}
                <span>{option.text}</span>
            </div>
        );
    };

    private _onRenderOption(option: IDropdownOption) {
        return (
            <div>
                {option.data && option.data.iconName && (
                    <Icon style={{ marginRight: '8px' }} iconName={option.data.iconName} aria-hidden="true" title={option.text} />
                )}
                <span>{option.text}</span>
            </div>
        );
    }
}
