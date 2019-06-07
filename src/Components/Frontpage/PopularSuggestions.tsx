import * as React from "react";
import { Accordion, Panel, Row, Col, Glyphicon, Button, FormGroup, ControlLabel, Checkbox } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { Status } from "../Common/Status";
import { Tools } from "../Common/Tools";
import * as _ from "lodash";
import { SustainabilityGoal } from "../Common/SustainabilityGoal";

enum SortTypes { DateAsc, DateDesc }
class Filter { Value: string; Type: string }
interface IPopularSuggestionsProps { Title: string, FromDate: string, ToDate: string }
interface PopularSuggestionsState { suggestions: Array<Suggestion>, top?: number, maxReached?: boolean, sorting?: SortTypes, filter?: Array<Filter>, showSorting?: boolean, showFilter?: boolean, filterValues: Array<Filter> }
export class PopularSuggestions extends React.Component<IPopularSuggestionsProps, PopularSuggestionsState>
{
    state = { suggestions: new Array<Suggestion>(), top: 3, maxReached: false, sorting: SortTypes.DateDesc, filter: new Array<Filter>(), showSorting: false, showFilter: false, filterValues: new Array<Filter>() };

    componentWillMount() {
        this.loadFilterValues();
        this.loadSuggestions(3);
    }

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
                customFilter += " and " + encodeURI(f.Type) + " eq '" + encodeURI(f.Value) + "'";
        }
        var d = new DataAdapter();
        d.getAllSuggestions(Status.Published, this.state.top, customFilter, customSort).then((results: Array<Suggestion>) => {
            this.setState({ suggestions: results },
                () => {
                    if (this.state.top > results.length)
                        this.setState({ maxReached: true });

                    this.setState({ top: this.state.top + incrementTop });
                });
        });
    }

    loadFilterValues() {
        var filters = new Array<Filter>();
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/fields?$filter=InternalName eq 'KmiUsefulnessType' or InternalName eq 'KmiTags'",
            type: "GET",
            headers: {
                "accept": "application/json;odata=verbose",
            },
            success: (data: any) => {
                for (let item of data.d.results) {
                    for (let choice of item.Choices.results) {
                        var filter = new Filter();
                        filter.Type = item.InternalName;
                        filter.Value = choice;
                        filters.push(filter);
                    }
                }
                this.setState({ filterValues: filters });
            },
            error: (error) => {
                alert(JSON.stringify(error));
            }
        });
    }

    suggestionCardTemplate(item: Suggestion): JSX.Element {
        var summary = item.Summary;
        var title = item.Title;
        let ellipsisLink = false;
        if (item.Summary && item.Summary.length > 150) {
            summary = item.Summary.substr(0, 150);
            ellipsisLink = true;
        }
        if (item.Title && item.Title.length > 100) {
            title = item.Title.substr(0, 100) + "...";
        }
        return (
            <article className="item">
                <a href={item.Url} className="img-block">
                    {item.Image == "" ? "" :
                        <img src={item.Image} width="298" height="200" alt="image description" />}
                </a>
                <div className="item-content">
                    <Row>
                        <Col xs={12}><h3><a href={item.Url}>{title}</a></h3></Col>
                    </Row>
                    <Row>
                        <Col xs={12}><p>{summary}{ellipsisLink ? <a href={item.Url}>...</a> : ''}</p></Col>

                    </Row>
                    <Row>
                        <Col xs={12} >
                            <footer className="fixed-bottom">
                                <div className="sustainabilityGoals">
                                    {item.SustainabilityGoals.map((goal: SustainabilityGoal) => {
                                        return <img src={goal.ImageSrc} style={{ display: "inline-block", minHeight: "auto", height: "47px", width: "47px", marginTop: "2px", marginRight: "5px" }} />
                                    })}
                                </div>
                                {(item.SustainabilityGoals.length > 0) ? <br /> : ""}
                                <time>{item.Created.getDate() + "." + (item.Created.getMonth() + 1) + "." + item.Created.getFullYear()}</time>
                                <strong className="author">{item.Submitter.Name}</strong>
                                {(Tools.IsLatLong(item.Location)) ? "" :
                                    <span>{item.Location}</span>}
                                <ul className="btn-list">
                                    <li>
                                        <a href="#"><i className="icon-like"></i><span className="counter">{item.Likes}</span></a>
                                    </li>
                                    <li>
                                        <a href="#"><i className="icon-comments"></i><span className="counter">{item.NumberOfComments}</span></a>
                                    </li>
                                </ul>
                            </footer>
                        </Col>
                    </Row>
                </div>
            </article>
        );
    }


    generatePopularSuggestions() {
        var items = this.state.suggestions;
        return _.chunk(items, 3).map(((item: Array<Suggestion>, idx: number) => {
            return (
                <Row key={`Row_${idx}`}>
                    {item.map((i: Suggestion, idx2: number) => (
                        <Col key={`Col_${idx}_${idx2}`} xs={4}>{this.suggestionCardTemplate(i)}</Col>
                    ))}
                </Row>
            )
        }).bind(this));
    }

    sortSuggestions(val: any) {
        this.setState({ sorting: (val.target.value == 2) ? SortTypes.DateAsc : SortTypes.DateDesc }, () => { this.loadSuggestions(0); });
    }

    renderSorting() {
        return (
            <div className="sortoptions" style={{ paddingBottom: "10px" }}>
                <FormGroup>
                    <ControlLabel>Sorter på: </ControlLabel>
                    <select className="form-control" onChange={this.sortSuggestions.bind(this)} style={{ maxWidth: "300px", margin: "0px auto" }}>
                        <option value="1" selected={(this.state.sorting == SortTypes.DateDesc)}>Dato nyest - eldst</option>
                        <option value="2" selected={(this.state.sorting == SortTypes.DateAsc)}>Dato eldst - nyest</option>
                    </select>
                </FormGroup>
            </div>)
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
        var usefulnessFilters = this.state.filterValues.filter((val: Filter) => { return val.Type === "UsefulnessType" });
        var tags = this.state.filterValues.filter((val: Filter) => { return val.Type === "Tags" });
        return (
            <div className="filteroptions">
                <Row>
                    <Col xs={12}><ControlLabel>Filtrer på:</ControlLabel></Col>
                </Row>
                <Row>
                    <Accordion>
                        <Panel header="Kategori" eventKey="1" style={{ cursor: "pointer" }} className="filter-body">
                            {_.chunk(tags, 2).map(
                                (
                                    (item: any) => {
                                        return <Row style={{ width: '100%' }}>{item.map((s: any) => { return this.renderFilter(s) })}</Row>
                                    }
                                ).bind(this))}
                        </Panel>
                        <Panel header="Nytteverdi" eventKey="2" style={{ cursor: "pointer" }} className="filter-body">
                            {_.chunk(usefulnessFilters, 2).map(
                                (
                                    (item: any) => {
                                        return <Row style={{ width: '100%' }}>{item.map((s: any) => { return this.renderFilter(s) })}</Row>
                                    }
                                ).bind(this))}
                        </Panel>
                    </Accordion>
                </Row>
            </div>
        )
    }

    renderFilter(filter: any) {
        return (
            <Col xs={6} style={{ textAlign: 'left' }}>
                <span  >
                    <label className="switch">
                        <input type="checkbox" name="filter" onChange={() => { this.toggleFilter(filter) }} />
                        <div className="slider round"></div>
                    </label>
                    <span style={{ marginLeft: "10px", verticalAlign: "text-bottom", wordBreak: "break-all" }}>{filter.Value}</span>
                </span>
            </Col>
        );
    }

    showFilter() {
        this.setState({ showSorting: false });
        this.setState({ showFilter: !this.state.showFilter });
    }

    showSorting() {
        this.setState({ showFilter: false });
        this.setState({ showSorting: !this.state.showSorting });
    }

    render() {
        return (
            <Row>
                <section className="item-section">
                    <div className="item-container">
                        <h2>{this.props.Title}
                            <div>
                                <Button onClick={this.showFilter.bind(this)} ><Glyphicon glyph="filter" /></Button>
                                <Button onClick={this.showSorting.bind(this)} ><Glyphicon glyph="sort" /></Button>
                            </div>
                        </h2>
                        {(!this.state.showSorting) ? "" : this.renderSorting()}
                        {(!this.state.showFilter) ? "" : this.renderFiltering()}
                        <div className="item-holder">
                            <Col xs={12}>
                                {this.generatePopularSuggestions()}
                            </Col>
                        </div>
                        {(this.state.maxReached) ? "" :
                            <a href="#" className="btn" onClick={this.loadMoreSuggestions.bind(this)}>Vis flere innsendte forslag</a>}
                    </div>
                </section>
            </Row>)
    }
}