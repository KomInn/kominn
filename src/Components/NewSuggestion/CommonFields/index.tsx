import * as React from "react";
import { Suggestion } from "../../Common/Suggestion";
import { Tools } from "../../Common/Tools";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { Dropdown } from "office-ui-fabric-react/lib/Dropdown";
import { ICommonFieldsState } from "./ICommonFieldsState";
import { ICommonFieldsProps } from "./ICommonFieldsProps";

export class CommonFields extends React.Component<ICommonFieldsProps, ICommonFieldsState>
{
    private suggestion: Suggestion;

    constructor(props: ICommonFieldsProps) {
        super(props);
        this.state = { usefulnessTypeChoices: [] };
    }

    componentWillMount() {
        this.suggestion = new Suggestion();
        this.setUsefulnessType();
    }

    async setUsefulnessType() {
        let result = await $.get(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/fields?$select=Choices&$filter=InternalName eq 'KmiUsefulnessType'`);
        let usefulnessTypeChoices = result.d.results[0].Choices.results.map((choice: string) => ({ key: choice, text: choice }));
        this.setState({ usefulnessTypeChoices });
        this.suggestion.UsefulnessType = this.state.usefulnessTypeChoices[0].text;
    }

    update() {
        this.props.onSuggestionUpdate(this.suggestion);
    }

    render() {
        var past = Tools.showPastText();
        var summaryPlaceholder = (past) ? "Beskriv hva som ble gjort med to setninger" : " Beskriv forslaget ditt med to setninger";
        var challengePlaceholder = (past) ? " Beskriv utfordringen(e) dere tok tak i" : "Beskriv utfordringen(e) dette forslaget er ment å ta tak i. Hvorfor er det viktig å ta tak i dette? Er det f.eks konkrete problemer du ønsker å løse? I så fall, hvor lenge har disse problemene eksistert?";
        var challengeText = (past) ? "Hva var utfordringen?" : "Utfordring";
        var solutionText = (past) ? "Hvordan ble det løst?" : "Løsningsforslag";
        var solutionPlaceholder = (past) ? "Beskriv hvordan utfordringen ble løst" : "Beskriv forslaget til løsning mer detaljert. Vet du noe om hva dette vil koste? Er det andre som må være med på å realisere løsningen? Etc.";
        var usefulnessPlaceholderText = (past) ? "Er løsningen nyttig for andre?" : "Kan forslaget ditt være nyttig for andre enn deg/din virksomhet?";
        var title = (past) ? "Dette har vi gjort" : "Nytt forslag";
        return (
            <section>
                <h2>{title}</h2>
                <div>
                    <TextField
                        label="Tittel"
                        required={true}
                        defaultValue={this.suggestion.Title}
                        onChange={(_event, newValue) => { this.suggestion.Title = newValue; this.update(); }} />
                    <TextField
                        label="Sammendrag"
                        placeholder={summaryPlaceholder}
                        required={true}
                        multiline={true}
                        defaultValue={this.suggestion.Summary}
                        onChange={(_event, newValue) => { this.suggestion.Summary = newValue; this.update(); }} />
                    <TextField
                        label={challengeText}
                        placeholder={challengePlaceholder}
                        required={true}
                        multiline={true}
                        defaultValue={this.suggestion.Challenges}
                        onChange={(_event, newValue) => { this.suggestion.Challenges = newValue; this.update(); }} />
                    <TextField
                        label={solutionText}
                        placeholder={solutionPlaceholder}
                        required={true}
                        multiline={true}
                        defaultValue={this.suggestion.SuggestedSolution}
                        onChange={(_event, newValue) => { this.suggestion.SuggestedSolution = newValue; this.update(); }} />
                    <Dropdown
                        label="Hvilken type nytte?"
                        options={this.state.usefulnessTypeChoices}
                        defaultSelectedKey={this.suggestion.UsefulnessType}
                        onChange={(_event, option) => { this.suggestion.UsefulnessType === option.text; this.update(); }} />

                    {this.suggestion.UsefulnessType === "Annet" && (
                        <TextField
                            required={true}
                            multiline={true}
                            onChange={(_event, newValue) => { this.suggestion.UsefulnessType = newValue; this.update(); }} />
                    )}
                    <TextField
                        label="Nyttig for andre?"
                        placeholder={usefulnessPlaceholderText}
                        required={true}
                        multiline={true}
                        onChange={(_event, newValue) => { this.suggestion.UsefulForOthers = newValue; this.update(); }} />
                </div>
            </section>
        )
    }
}