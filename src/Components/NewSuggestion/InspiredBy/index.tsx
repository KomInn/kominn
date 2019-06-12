import * as React from "react";
import { Suggestion } from "../../Common/Suggestion";
import { DataAdapter } from "../../Common/DataAdapter";
import { DetailsList, Selection, SelectionMode } from "office-ui-fabric-react/lib/DetailsList";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import { IInspiredByState } from "./IInspiredByState";
import { IInspiredByProps } from "./IInspiredByProps";


export class InspiredBy extends React.Component<IInspiredByProps, IInspiredByState>
{
    private suggestionSelection: Selection;
    private inspiredBySelection: Selection;
    private dataAdapter = new DataAdapter();

    constructor(props: IInspiredByProps) {
        super(props);
        this.state = {
            suggestions: [],
            inspiredBy: [],
            searchTerm: "",
        };
        this.suggestionSelection = new Selection();
        this.inspiredBySelection = new Selection();
    }

    async componentWillMount() {
        var copiedSuggestion = GetUrlKeyValue("kopier");
        if (copiedSuggestion) {
            let inspiredBy = await this.dataAdapter.getSuggestionById(copiedSuggestion);
            if (inspiredBy.length > 0) {
                this.setState({ inspiredBy })
            }
        }
    }

    @autobind
    async searchSuggestion(_evt: any, searchTerm: string) {
        this.setState({ searchTerm });
        if (searchTerm == null || searchTerm == "" || searchTerm.length <= 3) {
            this.setState({ suggestions: [] });
            return;
        }
        let suggestions = await this.dataAdapter.getSuggestionByTitle(searchTerm);
        suggestions = suggestions.filter(s => this.state.inspiredBy.indexOf(s) === -1);
        this.setState({ suggestions });
    }

    @autobind
    addInspiredBy() {
        let { inspiredBy } = { ...this.state } as IInspiredByState;
        inspiredBy.push(...this.suggestionSelection.getItems() as Suggestion[]);
        this.setState({ inspiredBy, searchTerm: "", suggestions: [] });
        this.props.onDataUpdate(inspiredBy);
    }

    @autobind
    removeInspiredBy() {
        let { inspiredBy } = { ...this.state } as IInspiredByState;
        inspiredBy = inspiredBy.filter(s => (this.inspiredBySelection.getItems() as Suggestion[]).indexOf(s) === -1);
        this.setState({ inspiredBy });
    }

    itemNotPreviouslySelected(s: Suggestion) {
        for (let item of this.state.inspiredBy) {
            if (item.Id == s.Id)
                return false;
        }
        return true;
    }

    removeItem(index: number) {
        var s = this.state.inspiredBy;
        s.splice(index, 1);
        this.setState({ inspiredBy: s });
    }

    render() {
        return (
            <div>
                <TextField
                    label="Inspirasjon (valgfritt)"
                    placeholder="Søk..."
                    onChange={this.searchSuggestion}
                    defaultValue={this.state.searchTerm} />
                <div hidden={this.state.suggestions.length === 0}>
                    <MarqueeSelection selection={this.suggestionSelection}>
                        <DetailsList
                            isHeaderVisible={false}
                            items={this.state.suggestions}
                            columns={[{ key: "Title", fieldName: "Title", name: "", minWidth: 100 }]}
                            selectionMode={SelectionMode.multiple}
                            selection={this.suggestionSelection}
                            selectionPreservedOnEmptyClick={true} />
                    </MarqueeSelection>
                    <DefaultButton text="Velg" onClick={this.addInspiredBy} />
                </div>
                <div style={{ marginTop: 20 }} hidden={this.state.inspiredBy.length === 0}>
                    <h3>Valgt</h3>
                    <MarqueeSelection selection={this.inspiredBySelection}>
                        <DetailsList
                            isHeaderVisible={false}
                            items={this.state.inspiredBy}
                            columns={[{ key: "Title", fieldName: "Title", name: "", minWidth: 100 }]}
                            selectionMode={SelectionMode.multiple}
                            selection={this.inspiredBySelection}
                            selectionPreservedOnEmptyClick={true} />
                    </MarqueeSelection>
                    <DefaultButton text="Fjerne" onClick={this.removeInspiredBy} />
                </div>
            </div>
        )
    }
}