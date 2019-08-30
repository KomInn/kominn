import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { Searchbar } from "../../Components/Frontpage/Searchbar";
import { Actions, Comments, Content, Details, InspiredBy, MapView, SuggestionRating, Summary } from "../../Components/ViewSuggestion";
import { DataAdapter } from "../../Data/DataAdapter";
import { IViewSuggestionState } from "./IViewSuggestionState";
import { Suggestion } from "../../Models";

export class ViewSuggestion extends React.Component<any, IViewSuggestionState>
{
    private dataAdapter = new DataAdapter();
    private config: any;

    constructor(props: any) {
        super(props);
        this.state = { suggestion: new Suggestion() };
    }

    componentWillMount() {
        this.dataAdapter.getConfig().then(config => {
            this.config = config;
            setInterval(this.loadSuggestion, 30000);
            this.loadSuggestion();
        });
    }

    @autobind
    loadSuggestion() {
        var id = GetUrlKeyValue("forslag");
        if (id == null || id == "") {
            this.redirectToFrontpage();
            return;
        }
        this.dataAdapter.getSuggestionById(id).then(
            (s: Suggestion[]) => {
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
        const { suggestion } = this.state;
        if (suggestion == null || suggestion.Id == -1) return null;

        return (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <section className="ms-Grid-col ms-sm12">
                        <Searchbar showBackButton={true} />
                    </section>
                </div>
                <div className="ms-Grid-row" style={{ paddingTop: 20 }}>
                    <section className="ms-Grid-col ms-sm7 ms-smPush1">
                        <Content suggestion={suggestion} />
                        <Summary suggestion={suggestion} />
                        <InspiredBy suggestion={suggestion} />
                    </section>
                    <section className="ms-Grid-col ms-sm3 ms-smPush1">
                        <Actions suggestion={suggestion} />
                        <SuggestionRating sugggestion={suggestion} />
                        <Details suggestion={suggestion} />
                        <MapView apiKey={this.config.GOOGLE_MAPS_API_KEY} suggestion={suggestion} />
                    </section>
                </div>
                <div className="ms-Grid-row">
                    <section className="ms-Grid-col ms-sm10 ms-smPush1 ms-smPull1">
                        <Comments suggestion={suggestion} onCommentSubmitted={this.loadSuggestion.bind(this)} />
                    </section>
                </div>
            </div>
        )
    }
}