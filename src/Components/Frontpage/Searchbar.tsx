import * as React from "react";
import { Row, Col, ListGroup, ListGroupItem } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { SubmitSuggestionButtons } from "../Common/SubmitSuggestionButtons"

interface InspiredByState { inspiredBy: Array<Suggestion>, suggestions: Array<Suggestion>, searchval?: string }
interface SearchbarProps { isBackNavigation?: boolean }

export class Searchbar extends React.Component<SearchbarProps, InspiredByState>
{

    state = { suggestions: new Array<Suggestion>(), inspiredBy: new Array<Suggestion>(), searchval: "" };


    searchSuggestion(evt: any) {
        this.setState({ searchval: evt.target.value }, () => {
            var title = this.state.searchval;
            if (title == null || title == "" || title.length <= 3) {
                this.setState({ suggestions: new Array<Suggestion>() });
                return;
            }

            var d = new DataAdapter();
            d.getSuggestionByTitle(title).then((result: Array<Suggestion>) => {
                this.setState({ suggestions: result });
            });
        });
    }

    renderSearchResults() {
        if (this.state.suggestions.length <= 0)
            return;


        return (

            <Row>
                <Col>
                    <ListGroup>
                        {this.state.suggestions.map((item: Suggestion, index: number) => {
                            return (
                                <ListGroupItem>
                                    {item.Image === "" ? "" :
                                        <img src={item.Image} style={{ width: "64px", verticalAlign: "middle", marginRight: "10px" }} />}
                                    <a href={item.Url}>{item.Title}</a>
                                </ListGroupItem>
                            )
                        })}
                    </ListGroup>
                </Col>
            </Row>);
    }


    render() {

        return (
            <Row className="searchbar">
                <Col xs={12}>
                    <Row>
                        {!this.props.isBackNavigation ? "" :
                            <Col md={1} mdPush={2}>
                                <a href={_spPageContextInfo.webAbsoluteUrl} className="btn green"><span className="glyphicon glyphicon-home"></span>&nbsp;Tilbake</a>
                            </Col>
                        }
                        <Col md={4} mdPush={1} sm={4} xs={12} lg={4} lgPush={2}>
                            <input id="search" type="search" placeholder="Søk etter forslag" onChange={this.searchSuggestion.bind(this)} value={this.state.searchval} />
                        </Col>
                        <SubmitSuggestionButtons />
                    </Row>
                    {this.renderSearchResults()}
                </Col>
            </Row>
        )
    }
}