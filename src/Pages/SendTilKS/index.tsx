import * as React from "react";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { DataAdapter } from "../../Data/DataAdapter";
import { Suggestion } from "../../Models";
import { ISendTilKSState } from "./ISendTilKSState";

export class SendTilKS extends React.Component<{}, ISendTilKSState>
{
    private dataAdapter: DataAdapter = new DataAdapter();

    constructor(props: any) {
        super(props);
        this.state = {
            selectedSuggestion: new Suggestion(),
            allSuggestions: [],
            message: "",
        }
    }

    componentWillMount() {
        this.loadSuggestions();
    }

    loadSuggestions() {
        this.dataAdapter.getAllSuggestions().then((a: Suggestion[]) => {
            this.setState({ allSuggestions: a });
        })
    }

    setSelected(i: IDropdownOption) {
        var item = this.state.allSuggestions.filter((s: Suggestion) => s.Id === i.key);
        if (!item || item.length < 1) {
            alert('En feil har oppstått, forslaget kan ikke sendes.'); // TODO: Fix
            return;
        }
        this.setState({ selectedSuggestion: item[0] }, () => {
            this.setState({ message: (item[0].SendTilKS) ? "Forslaget er allerede sendt inn." : "" });
        });
    }

    submitToKS() {
        this.dataAdapter.submitToInduct(this.state.selectedSuggestion).then((s: string) => {
            console.log("res ", s);
            this.setState({ selectedSuggestion: new Suggestion(), message: "Forslaget er sendt til Induct." }, () => this.loadSuggestions());
        });

    }

    render() {
        if (!this.state.allSuggestions)
            return <div></div>

        var items = this.state.allSuggestions.map((s: Suggestion) => {
            return { key: s.Id, text: s.Title } as IDropdownOption;
        })
        return <div style={{ marginLeft: "10px" }}>
            <h1 style={{ color: "black" }}>Eksporter til KS</h1>
            <a href={_spPageContextInfo.webAbsoluteUrl + "/Lists/InductKonfigurasjon/AllItems.aspx"}>Konfigurasjon</a>

            <Dropdown label="Velg forslag" options={items} onChanged={(i: IDropdownOption) => { this.setSelected(i); }} /><br />
            <DefaultButton text="Send til KS"
                disabled={(this.state.selectedSuggestion.Id === -1 || this.state.selectedSuggestion.SendTilKS)}
                onClick={() => { this.submitToKS() }} />


            <p dangerouslySetInnerHTML={{ __html: this.state.message }}></p>
        </div>
    }
}


