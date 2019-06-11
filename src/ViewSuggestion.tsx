import * as React from "react";
import { Searchbar } from "./Components/Frontpage/Searchbar";
import { Content } from "./Components/ViewSuggestion/Content";
import { Actions } from "./Components/ViewSuggestion/Actions";
import { Summary } from "./Components/ViewSuggestion/Summary";
import { MapView } from "./Components/ViewSuggestion/Map";
import { InspiredBy } from "./Components/ViewSuggestion/InspiredBy";
import { Comments } from "./Components/ViewSuggestion/Comments";
import { Suggestion } from "./Components/Common/Suggestion";
import { DataAdapter } from "./Components/Common/DataAdapter";
import { autobind } from "office-ui-fabric-react/lib/Utilities";

interface IViewSuggestionState { suggestion: Suggestion }
export class ViewSuggestion extends React.Component<any, IViewSuggestionState>
{
    constructor(props: any) {
        super(props);
        this.state = { suggestion: new Suggestion() };
    }

    componentWillMount() {
        setInterval(this.loadSuggestion, 30000);
        this.loadSuggestion();
    }

    @autobind
    loadSuggestion() {
        var id = GetUrlKeyValue("forslag");
        if (id == null || id == "") {
            this.redirectToFrontpage();
            return;
        }
        var da = new DataAdapter();
        da.getSuggestionById(id).then(
            (s: Array<Suggestion>) => {
                if (s.length <= 0) {
                    this.redirectToFrontpage();
                    return;
                }
                da.getCommentsForSuggestion(s[0]).then((result: Suggestion) => {
                    this.setState({ suggestion: result });
                });
            });
    }

    redirectToFrontpage() {
        document.location.href = _spPageContextInfo.webAbsoluteUrl;
    }

    render() {
        if (this.state.suggestion == null || this.state.suggestion.Id == -1)
            return null;

        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <section className="ms-Grid-col ms-sm12">
                        <Searchbar isBackNavigation={true} />
                    </section>
                    <section className="ms-Grid-col ms-sm7 ms-smPush1">
                        <Content suggestion={this.state.suggestion} />
                        <Summary suggestion={this.state.suggestion} />
                        <InspiredBy suggestion={this.state.suggestion} />
                    </section>
                    <section className="ms-Grid-col ms-sm3 ms-smPush1">
                        <Actions suggestion={this.state.suggestion} />
                        <MapView suggestion={this.state.suggestion} />
                    </section>
                    <section className="ms-Grid-col ms-sm10 ms-smPush1 ms-smPull1">
                        <Comments suggestion={this.state.suggestion} onCommentSubmitted={this.loadSuggestion.bind(this)} />
                    </section>
                </div>
            </div>
        )
    }
}