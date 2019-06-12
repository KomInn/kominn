import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import { Callout } from "office-ui-fabric-react/lib/Callout";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { SubmitSuggestionButtons } from "../Common/SubmitSuggestionButtons"

interface ISearchbarState { inspiredBy: Array<Suggestion>, suggestions: Array<Suggestion>, searchTerm?: string, showSuggestions?: boolean }
interface ISearchbarProps { isBackNavigation?: boolean }

export class Searchbar extends React.Component<ISearchbarProps, ISearchbarState>
{
    private dataAdapter = new DataAdapter();

    constructor(props: ISearchbarProps) {
        super(props);
        this.state = {
            suggestions: new Array<Suggestion>(),
            inspiredBy: new Array<Suggestion>(),
            searchTerm: "",
            showSuggestions: false,
        };
    }

    @autobind
    searchSuggestion(searchTerm: string) {
        this.setState({ searchTerm });
        if (searchTerm.length <= 3) {
            this.setState({ suggestions: new Array<Suggestion>() });
            return;
        }
        this.dataAdapter.getSuggestionByTitle(searchTerm).then((suggestions: Array<Suggestion>) => {
            this.setState({ suggestions, showSuggestions: suggestions.length > 0 });
        });
    }

    renderSearchResults() {
        return (
            <Callout
                hidden={!this.state.showSuggestions}
                target={this.refs["SearchBox"] as any}
                isBeakVisible={false}
                gapSpace={10}
                onDismiss={_ => this.setState({ showSuggestions: false })}>
                <div style={{ padding: 25 }}>
                    {this.state.suggestions.map((item: Suggestion, idx: number) => <div key={idx}><a href={item.Url}>{item.Title}</a></div>)}
                </div>
            </Callout>
        );
    }


    render() {
        return (
            <div className="ms-Grid searchbar">
                <div className="ms-Grid-row">
                    {this.props.isBackNavigation &&
                        <div className="ms-Grid-col ms-sm2 ms-smPush1">
                            <DefaultButton
                                href={_spPageContextInfo.webAbsoluteUrl}
                                iconProps={{ iconName: "Home" }}
                                text="Tilbake" />
                        </div>
                    }
                    <div ref="SearchBox" className="ms-Grid-col ms-sm4">
                        <SearchBox placeholder="Søk etter forslag..." onChange={this.searchSuggestion} />
                    </div>
                    <div className="ms-Grid-col ms-sm4">
                        <SubmitSuggestionButtons />
                    </div>
                </div>
                {this.renderSearchResults()}
            </div>
        )
    }
}