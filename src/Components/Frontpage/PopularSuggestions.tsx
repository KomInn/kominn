import * as React from "react";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { Status } from "../Common/Status";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Toggle } from "office-ui-fabric-react/lib/Toggle";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { DocumentCard, DocumentCardLocation, DocumentCardPreview, DocumentCardTitle, DocumentCardActions } from "office-ui-fabric-react/lib/DocumentCard";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as _ from "lodash";

enum SortTypes { DateAsc, DateDesc }
class Filter { Value: string; Type: string }
interface IPopularSuggestionsProps { Title: string, FromDate: string, ToDate: string }
interface PopularSuggestionsState {
    suggestions: Array<Suggestion>,
    top?: number,
    maxReached?: boolean,
    sorting?: SortTypes,
    filter?: Array<Filter>,
    showSorting?: boolean,
    showFilter?: boolean,
    filterValues: Array<Filter>
}
export class PopularSuggestions extends React.Component<IPopularSuggestionsProps, PopularSuggestionsState>
{
    dataAdapter: DataAdapter;

    constructor(props: IPopularSuggestionsProps) {
        super(props);
        this.state = {
            suggestions: new Array<Suggestion>(),
            top: 3,
            sorting: SortTypes.DateDesc,
            filter: new Array<Filter>(),
            filterValues: new Array<Filter>(),
        };
        this.dataAdapter = new DataAdapter();
    }

    componentDidMount() {
        this.loadFilterValues();
        this.loadSuggestions(3);
    }

    @autobind
    loadMoreSuggestions() {
        this.loadSuggestions(3);
    }

    loadSuggestions(incrementTop?: number) {
        var customSort = "";
        if (this.state.sorting != null) {
            if (this.state.sorting == SortTypes.DateAsc)
                customSort = "&$orderby=Created asc";
            else
                customSort = "&$orderby=Created desc";
        }

        var customFilter = "&$filter=KmiStatus eq 'Publisert'";
        customFilter += " and Created gt '" + this.props.FromDate + "' and Created lt '" + this.props.ToDate + "'";
        if (this.state.filter != null && this.state.filter.length > 0) {
            for (let f of this.state.filter)
                customFilter += ` and ${encodeURI(`Kmi${f.Type}`)} eq '${encodeURI(f.Value)}'`;
        }
        this.dataAdapter.getAllSuggestions(Status.Published, this.state.top, customFilter, customSort)
            .then((results: Array<Suggestion>) => {
                this.setState({ suggestions: results },
                    () => {
                        if (this.state.top > results.length)
                            this.setState({ maxReached: true });

                        this.setState({ top: this.state.top + incrementTop });
                    });
            });
    }

    loadFilterValues() {
        var filterValues = new Array<Filter>();
        $.ajax({
            url: `${_spPageContextInfo.webAbsoluteUrl}/_api/web/fields?$filter=InternalName eq 'KmiUsefulnessType' or InternalName eq 'KmiTags'`,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: (data: any) => {
                for (let item of data.d.results) {
                    for (let choice of item.Choices.results) {
                        var filter = new Filter();
                        filter.Type = item.InternalName.replace("Kmi", "");
                        filter.Value = choice;
                        filterValues.push(filter);
                    }
                }
                this.setState({ filterValues });
            },
            error: (error) => {
                alert(JSON.stringify(error));
            }
        });
    }

    renderPopularSuggestions() {
        return this.state.suggestions.map((i: Suggestion, idx: number) => (
            <div key={`Card_${idx}`} style={{ verticalAlign: "top", display: "inline-block", margin: "0 10px 10px 0" }}>
                <DocumentCard onClickHref={i.Url}>
                    <DocumentCardPreview previewImages={[{ previewImageSrc: i.Image }]} />
                    <DocumentCardTitle title={i.Title} />
                    <DocumentCardLocation location={i.Created.toLocaleDateString()} />
                    <DocumentCardLocation location={i.Submitter.Name} />
                    <DocumentCardLocation location={i.Location} />
                    <DocumentCardActions actions={[
                        { onClick: () => this.dataAdapter.updateLike(i), iconProps: { iconName: "Like" }, name: `${i.Likes}`, },
                        { iconProps: { iconName: "Comment" }, name: `${i.NumberOfComments}`, },
                    ]} />
                </DocumentCard>
            </div>
        ));
    }

    @autobind
    sortSuggestions(option: IDropdownOption) {
        this.setState({ sorting: option.data });
        this.loadSuggestions(0);
    }

    renderSorting() {
        return (
            <div style={{ paddingBottom: "10px" }}>
                <Dropdown
                    onChange={(_event, option) => this.sortSuggestions(option)}
                    defaultSelectedKey="DateDesc"
                    options={[
                        { key: "DateDesc", text: "Dato nyest - eldst", data: SortTypes.DateDesc },
                        { key: "DateAsc", text: "Dato eldst - nyest", data: SortTypes.DateAsc }
                    ]} />
            </div>
        );
    }

    toggleFilter(filter: Filter) {
        var filters = this.state.filter;
        var existed = false;
        for (var i = 0; i < filters.length; i++) {
            if (filters[i].Value === filter.Value && filters[i].Type === filter.Type) {
                filters.splice(i, 1);
                existed = true;
            }
        }
        if (!existed)
            filters.push(filter);

        this.setState({ filter: filters }, () => this.loadSuggestions(0));
    }

    renderFiltering() {
        var tags = this.state.filterValues.filter((val: Filter) => val.Type === "Tags");
        var usefulnessFilters = this.state.filterValues.filter((val: Filter) => val.Type === "UsefulnessType");
        return (
            <div className="ms-Grid filteroptions">
                <div className="ms-Grid-row">
                    <h4 style={{ marginTop: 10 }}>Kategori</h4>

                    {tags.map((filter) => this.renderFilter(filter))}
                </div>
                <div className="ms-Grid-row">
                    <h4 style={{ marginTop: 10 }}>Nytteverdi</h4>
                    {usefulnessFilters.map((filter) => this.renderFilter(filter))}
                </div>
            </div>
        )
    }

    renderFilter(filter: Filter) {
        return (
            <div className="ms-Grid-col ms-sm6">
                <Toggle label={filter.Value} onChange={_ => this.toggleFilter(filter)} />
            </div>
        );
    }

    @autobind
    showFilter() {
        this.setState({ showSorting: false, showFilter: !this.state.showFilter });
    }

    @autobind
    showSorting() {
        this.setState({ showFilter: false, showSorting: !this.state.showSorting });
    }

    render() {
        if (this.state.suggestions.length === 0) {
            return null;
        }
        return (
            <section className="item-section">
                <div className="item-container">
                    <h2>{this.props.Title}</h2>
                    <div style={{ marginBottom: 20 }}>
                        <DefaultButton onClick={this.showFilter} iconProps={{ iconName: "Filter" }} />
                        <DefaultButton onClick={this.showSorting} iconProps={{ iconName: "Sort" }} />
                    </div>
                    {this.state.showSorting && this.renderSorting()}
                    {this.state.showFilter && this.renderFiltering()}
                    {this.renderPopularSuggestions()}
                    <div style={{ marginTop: 20 }}>
                        <DefaultButton onClick={this.loadMoreSuggestions} text="Vis flere innsendte forslag" hidden={this.state.maxReached} />
                    </div>
                </div>
            </section>
        );
    }
}