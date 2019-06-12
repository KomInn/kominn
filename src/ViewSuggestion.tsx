import * as React from "react";
import { Searchbar } from "./Components/Frontpage/Searchbar";
import { Content, Actions, Summary, MapView, InspiredBy, Comments } from "./Components/ViewSuggestion";
import { Suggestion } from "./Components/Common/Suggestion";
import { DataAdapter } from "./Components/Common/DataAdapter";
import { autobind } from "office-ui-fabric-react/lib/Utilities";

interface IViewSuggestionState { suggestion: Suggestion }
export class ViewSuggestion extends React.Component<any, IViewSuggestionState>
{
    private dataAdapter = new DataAdapter();

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
        this.dataAdapter.getSuggestionById(id).then(
            (s: Array<Suggestion>) => {
                if (s.length <= 0) {
                    this.redirectToFrontpage();
                    return;
                }
                this.dataAdapter.getCommentsForSuggestion(s[0]).then((suggestion: Suggestion) => {
                    this.setState({ suggestion });
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