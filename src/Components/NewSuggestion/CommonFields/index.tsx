import * as React from "react";
import { Tools } from "../../../Tools";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { Dropdown } from "office-ui-fabric-react/lib/Dropdown";
import { ComboBox, IComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { ICommonFieldsState } from "./ICommonFieldsState";
import { ICommonFieldsProps } from "./ICommonFieldsProps";
import { Suggestion } from "../../../Models";

export class CommonFields extends React.Component<ICommonFieldsProps, ICommonFieldsState>
{
    private suggestion: Suggestion;
    private focusAreas: string[];

    constructor(props: ICommonFieldsProps) {
        super(props);
        this.state = { usefulnessTypeChoices: [] };
        this.focusAreas = [];
    }

    componentWillMount() {
        this.suggestion = new Suggestion();
        this.setUsefulnessType();
    }

    async setUsefulnessType() {
        let result = await $.get(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/fields?$select=Choices&$filter=InternalName eq 'KmiUsefulnessType'`);
        let usefulnessTypeChoices = result.d.results[0].Choices.results.map((choice: string) => ({ key: choice, text: choice }));
        this.setState({ usefulnessTypeChoices });
    }

    update() {
        this.props.onSuggestionUpdate(this.suggestion);
    }

    onComboBoxMultiChange = async (event: React.FormEvent<IComboBox>, option: IComboBoxOption): Promise<void> => {
        if (option.selected) {
          this.focusAreas.push(option.text);
        }
        else {
          this.focusAreas.indexOf(option.text) !== -1 && this.focusAreas.splice(this.focusAreas.indexOf(option.text), 1);
        }
        this.suggestion.UsefulnessType = this.focusAreas;
        this.update();
      }

    render() {
        var past = Tools.showPastText();
        var titlePlaceholder = past ? "Dette ble gjort" : "Hva kaller du tiltaket ditt?";
        var summaryPlaceholder = (past) ? "Beskriv hva som ble gjort med to setninger" : "Beskriv tiltaket ditt med to setninger";
        var challengePlaceholder = (past) ? "Beskriv utfordringen(e) dere tok tak i" : "Hvordan bidrar tiltaket til reduksjon av klimagasser eller en omstilling til lavutslippsamfunnet?";
        var challengeText = (past) ? "Hva var klimatiltaket?" : "Hvorfor er dette et klimatiltak?";
        var solutionText = (past) ? "Hvordan ble det løst?" : "Løsningsforslag";
        var solutionPlaceholder = (past) ? "Beskriv hvordan utfordringen ble løst" : "Beskriv forslaget til løsning mer detaljert. Vet du noe om hva dette vil koste? Er det andre som må være med på å realisere løsningen? Etc.";
        var usefulnessPlaceholderText = (past) ? "Er løsningen nyttig for andre?" : "Kan forslaget ditt være nyttig for andre enn deg/din virksomhet?";
        var title = (past) ? "Dette har vi gjort" : "Ny søknad";
        return (
            <section>
                <h2>{title}</h2>
                <div>
                    <TextField
                        label="Tittel"
                        placeholder={titlePlaceholder}
                        required={true}
                        defaultValue={this.suggestion.Title}
                        onChange={(_event, newValue) => { this.suggestion.Title = newValue; this.update(); }} />
                    <TextField
                        label="Beskrivelse av tiltaket"
                        placeholder={summaryPlaceholder}
                        required={true}
                        multiline={true}
                        defaultValue={this.suggestion.Summary}
                        onChange={(_event, newValue) => { this.suggestion.Summary = newValue; this.update(); }} />
                    <TextField
                            label="Hvor mye penger søker du om?"
                            placeholder={"Angi summen du søker om i norske kroner"}
                            required={true}
                            multiline={false}
                            defaultValue={this.suggestion.Amount}
                            onChange={(_event, newValue) => { this.suggestion.Amount = newValue; this.update(); }} />
                    <TextField
                        label={challengeText}
                        placeholder={challengePlaceholder}
                        required={true}
                        multiline={true}
                        defaultValue={this.suggestion.Challenges}
                        onChange={(_event, newValue) => { this.suggestion.Challenges = newValue; this.update(); }} />
                    {/* <TextField
                        label={solutionText}
                        placeholder={solutionPlaceholder}
                        required={true}
                        multiline={true}
                        defaultValue={this.suggestion.SuggestedSolution}
                        onChange={(_event, newValue) => { this.suggestion.SuggestedSolution = newValue; this.update(); }} /> */}
                    <ComboBox
                        label="Hvilke Innsatsområder fra klimaplanen vil tiltaket støtte opp under?"
                        options={this.state.usefulnessTypeChoices}
                        multiSelect
                        onChange={this.onComboBoxMultiChange} />
                    {/* <TextField
                        label="Nyttig for andre?"
                        placeholder={usefulnessPlaceholderText}
                        required={true}
                        multiline={true}
                        onChange={(_event, newValue) => { this.suggestion.UsefulForOthers = newValue; this.update(); }} /> */}
                </div>
            </section>
        )
    }
}