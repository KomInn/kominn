import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { DocumentCard, DocumentCardActions, DocumentCardLocation, DocumentCardPreview, DocumentCardTitle } from "office-ui-fabric-react/lib/DocumentCard";
import { ImageFit } from "office-ui-fabric-react/lib/Image";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import * as React from "react";
import { DataAdapter } from "../../../Data/DataAdapter";
import { Status, Suggestion } from "../../../Models";
import { Tools } from '../../../Tools';
import { SustainabilityGoals } from "../../Common";
import { IPopularSuggestionsProps } from "./IPopularSuggestionsProps";
import { IPopularSuggestionsState } from "./IPopularSuggestionsState";
import "./PopularSuggestions.module.scss";
import PopularSuggestionsFilters from "./PopularSuggestionsFilters";
import { PopularSuggestionsFilter } from "./PopularSuggestionsFilters/PopularSuggestionsFilter";
import PopularSuggestionsFiltersSorting from "./PopularSuggestionsFiltersSorting";
import { PopularSuggestionsSortTypes } from "./PopularSuggestionsFiltersSorting/PopularSuggestionsSortTypes";

export class PopularSuggestions extends React.Component<IPopularSuggestionsProps, IPopularSuggestionsState>
{
    private dataAdapter: DataAdapter = new DataAdapter();

    constructor(props: IPopularSuggestionsProps) {
        super(props);
        this.state = {
            suggestions: [],
            top: 3,
            sorting: PopularSuggestionsSortTypes.DateDesc,
            filter: [],
            filterValues: [],
        };
    }

    public componentDidMount() {
        this.loadFilterValues();
        this.loadSuggestions(3);
    }

    public render() {
        return (
            <section className="PopularSuggestions">
                <h2>{this.props.title}</h2>
                <div className="actions">
                    <DefaultButton onClick={this.showFilter.bind(this)} iconProps={{ iconName: "Filter" }} />
                    <DefaultButton onClick={this.showSorting.bind(this)} iconProps={{ iconName: "Sort" }} />
                </div>
                <PopularSuggestionsFiltersSorting hidden={!this.state.showSorting} onSort={this.sortSuggestions.bind(this)} />
                <PopularSuggestionsFilters
                    hidden={!this.state.showFilter}
                    filters={this.state.filterValues}
                    onChanged={this.toggleFilter.bind(this)} />
                {this.renderPopularSuggestions()}
                <div className="footer actions" hidden={this.state.suggestions.length === 0}>
                    <DefaultButton onClick={this.loadMoreSuggestions.bind(this)} text="Vis flere innsendte forslag" hidden={this.state.maxReached} />
                </div>
            </section>
        );
    }


    private loadMoreSuggestions() {
        this.loadSuggestions(3);
    }

    private async loadSuggestions(incrementTop?: number) {
        var customSort = "";
        if (this.state.sorting != null) {
            if (this.state.sorting == PopularSuggestionsSortTypes.DateAsc)
                customSort = "&$orderby=Created asc";
            else
                customSort = "&$orderby=Created desc";
        }

        var customFilter = `&$filter=KmiStatus eq 'Publisert' and Created gt datetime'${this.props.fromDate.toISOString()}' and Created lt datetime'${this.props.toDate.toISOString()}'`;
        if (this.state.filter != null && this.state.filter.length > 0) {
            for (let f of this.state.filter)
                customFilter += ` and ${encodeURI(`Kmi${f.Type}`)} eq '${encodeURI(f.Value)}'`;
        }
        let suggestions = await this.dataAdapter.getAllSuggestions(Status.Published, this.state.top, customFilter, customSort);
        this.setState({
            suggestions,
            top: this.state.top + incrementTop,
            maxReached: this.state.top > suggestions.length,
        });
    }

    private loadFilterValues() {
        var filterValues = [];
        $.ajax({
            url: `${_spPageContextInfo.webAbsoluteUrl}/_api/web/fields?$filter=InternalName eq 'KmiUsefulnessType' or InternalName eq 'KmiTags'`,
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: (data: any) => {
                for (let item of data.d.results) {
                    for (let choice of item.Choices.results) {
                        var filter = new PopularSuggestionsFilter();
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

    private renderPopularSuggestions() {
        if (this.state.suggestions.length === 0) {
            return (
                <div style={{ width: 500, margin: "0 auto 0 auto" }}>
                    <MessageBar messageBarType={MessageBarType.info}>{this.props.emptyText}</MessageBar>
                </div>
            );
        }
        return this.state.suggestions.map((suggestion: Suggestion, idx: number) => (
            <div key={idx} style={{ verticalAlign: "top", display: "inline-block", margin: "0 10px 10px 0" }}>
                <DocumentCard onClickHref={suggestion.Url}>
                    <DocumentCardPreview previewImages={[{ previewImageSrc: suggestion.Image, width: 318, height: 140, imageFit: ImageFit.cover }]} />
                    <DocumentCardTitle title={suggestion.Title} />
                    <DocumentCardLocation location={Tools.formatDate(suggestion.Created)} />
                    <DocumentCardLocation location={suggestion.Submitter.Name} />
                    <SustainabilityGoals style={{ margin: '10px 0 10px 0' }} goals={suggestion.SustainabilityGoals} />
                    <DocumentCardActions actions={[
                        { onClick: () => this.dataAdapter.updateLike(suggestion), iconProps: { iconName: "Like" }, name: `${suggestion.Likes}`, },
                        { iconProps: { iconName: "Comment" }, name: `${suggestion.NumberOfComments}`, },
                    ]} />
                </DocumentCard>
            </div>
        ));
    }

    private sortSuggestions(sorting: PopularSuggestionsSortTypes) {
        this.setState({ sorting });
        this.loadSuggestions(0);
    }

    private toggleFilter(filter: PopularSuggestionsFilter) {
        var filters = this.state.filter;
        var exists = false;
        for (var i = 0; i < filters.length; i++) {
            if (filters[i].Value === filter.Value && filters[i].Type === filter.Type) {
                filters.splice(i, 1);
                exists = true;
            }
        }
        if (!exists) filters.push(filter);
        this.setState({ filter: filters }, () => this.loadSuggestions(0));
    }

    showFilter() {
        this.setState({ showSorting: false, showFilter: !this.state.showFilter });
    }

    showSorting() {
        this.setState({ showFilter: false, showSorting: !this.state.showSorting });
    }

}