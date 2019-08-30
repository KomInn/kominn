import * as React from "react";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import { Callout } from "office-ui-fabric-react/lib/Callout";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { DataAdapter } from "../../../Data/DataAdapter";
import { SubmitSuggestionButtons } from "../../Common/SubmitSuggestionButtons"

interface ISearchbarState {
    inspiredBy: Array<Suggestion>;
    suggestions: Array<Suggestion>;
    searchTerm?: string;
    showSuggestions?: boolean;
}
interface ISearchbarProps {
    showBackButton?: boolean;
    showSearchBox?: boolean;
    showSuggestionButtons?: boolean;
}


export class Searchbar extends React.Component<ISearchbarProps, ISearchbarState>
{
    public static defaultProps: Partial<ISearchbarProps> = {
        showSearchBox: true,
        showSuggestionButtons: true,
    }
    private dataAdapter = new DataAdapter();

    constructor(props: ISearchbarProps) {
        super(props);
        this.state = {
            suggestions: [],
            inspiredBy: [],
            searchTerm: "",
            showSuggestions: false,
        };
    }

    @autobind
    async searchSuggestion(searchTerm: string) {
        this.setState({ searchTerm });
        if (searchTerm.length <= 3) {
            this.setState({ suggestions: [] });
            return;
        }
        let suggestions = await this.dataAdapter.getSuggestionByTitle(searchTerm);
        suggestions = suggestions.filter(s => this.state.inspiredBy.indexOf(s) === -1);
        this.setState({ suggestions, showSuggestions: suggestions.length > 0 });
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
            <div className="ms-Grid SearchBar">
                <div className="ms-Grid-row">
                    <div hidden={!this.props.showBackButton} className="ms-Grid-col ms-sm2 ms-smPush1">
                        <DefaultButton
                            href={_spPageContextInfo.webAbsoluteUrl}
                            iconProps={{ iconName: "Home" }}
                            text="Tilbake" />
                    </div>
                    <div ref="SearchBox" hidden={!this.props.showSearchBox} className="ms-Grid-col ms-sm4">
                        <SearchBox placeholder="Søk etter forslag..." onChange={this.searchSuggestion} />
                    </div>
                    <div hidden={!this.props.showSuggestionButtons} className="ms-Grid-col ms-sm4">
                        <SubmitSuggestionButtons />
                    </div>
                </div>
                {this.renderSearchResults()}
            </div>
        )
    }
}