import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { SubmitSuggestionButtons } from "../Common/SubmitSuggestionButtons"

interface InspiredByState { inspiredBy: Array<Suggestion>, suggestions: Array<Suggestion>, searchTerm?: string }
interface SearchbarProps { isBackNavigation?: boolean }

export class Searchbar extends React.Component<SearchbarProps, InspiredByState>
{
    constructor(props: SearchbarProps) {
        super(props);
        this.state = {
            suggestions: new Array<Suggestion>(),
            inspiredBy: new Array<Suggestion>(),
            searchTerm: "",
        };
    }

    @autobind
    searchSuggestion(searchTerm: string) {
        this.setState({ searchTerm });
        if (searchTerm.length <= 3) {
            this.setState({ suggestions: new Array<Suggestion>() });
            return;
        }
        new DataAdapter().getSuggestionByTitle(searchTerm).then((suggestions: Array<Suggestion>) => {
            this.setState({ suggestions });
        });
    }

    renderSearchResults() {
        if (this.state.suggestions.length === 0)
            return null;
        console.log(this.state);
        return (
            <div className="ms-Grid-row">
                {this.state.suggestions.map((item: Suggestion, idx: number) => {
                    return (
                        <div>
                            <a href={item.Url}>{item.Title}</a>
                        </div>
                    )
                })}
            </div >
        );
    }


    render() {
        return (
            <div className="ms-Grid searchbar">
                <div className="ms-Grid-row">
                    {this.props.isBackNavigation &&
                        <div className="ms-Grid-col ms-sm2 ms-smPush1">
                            <DefaultButton href={_spPageContextInfo.webAbsoluteUrl} text="Tilbake" />
                        </div>
                    }
                    <div className="ms-Grid-col ms-sm4">
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