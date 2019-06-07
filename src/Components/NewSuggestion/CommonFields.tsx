import * as React from "react";
import { Row, Col, FormGroup, FormControl, HelpBlock, ControlLabel } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { ErrorLabel } from "../Common/CustomLabels"
import { Tools } from "../Common/Tools";
/* TODO: Implement validation - REVISE */
interface ICommonFieldsProps { onSuggestionUpdate?(suggestion: Suggestion): void, validationMode: boolean }
interface ICommonFieldsState { usefulnessTypeChoices: Array<string> }
export class CommonFields extends React.Component<ICommonFieldsProps, ICommonFieldsState>
{
    _suggestion: Suggestion;
    state = { usefulnessTypeChoices: new Array<string>() }

    componentWillMount() {
        this._suggestion = new Suggestion();
        this.setUsefulnessType();
    }

    setUsefulnessType() {
        $.get(_spPageContextInfo.webAbsoluteUrl + "/_api/web/fields?$select=Choices&$filter=InternalName eq 'KmiUsefulnessType'").then((result: any) => {
            var r = result.d.results[0].Choices.results.map(
                (item: string) => {
                    return item;
                });
            this.setState({ usefulnessTypeChoices: r }, () => {
                this._suggestion.UsefulnessType = this.state.usefulnessTypeChoices[0];
            });
        });
    }

    set(event: any) {
        return event.target.value;
    }
    update() {
        this.props.onSuggestionUpdate(this._suggestion);
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

        var showValidationMessages = false;
        return (
            <Row>
                <Col xs={12}>
                    <div className="form-section">
                        <h2>{title}</h2>
                        <div >
                            <Row>
                                <Col xs={12}>
                                    <FormGroup validationState={((this.props.validationMode && (this._suggestion.Title == null || this._suggestion.Title.length <= 0) ? "error" : null))}>
                                        <ControlLabel>Tittel *</ControlLabel>
                                        <FormControl type="text" onChange={(a: any) => { this._suggestion.Title = this.set(a); this.update(); }} value={this._suggestion.Title} />
                                        <FormControl.Feedback />
                                    </FormGroup>

                                    <FormGroup validationState={((this.props.validationMode && (this._suggestion.Summary == null || this._suggestion.Summary.length <= 0) ? "error" : null))}>
                                        <ControlLabel>Sammendrag *</ControlLabel>
                                        <FormControl placeholder={summaryPlaceholder} componentClass="textarea" onChange={(a: any) => { this._suggestion.Summary = this.set(a); this.update(); }} value={this._suggestion.Summary} />
                                        <FormControl.Feedback />
                                    </FormGroup>

                                    <FormGroup validationState={((this.props.validationMode && (this._suggestion.Challenges == null || this._suggestion.Challenges.length <= 0) ? "error" : null))}>
                                        <ControlLabel>{challengeText} *</ControlLabel>
                                        <FormControl placeholder={challengePlaceholder} componentClass="textarea" onChange={(a: any) => { this._suggestion.Challenges = this.set(a); this.update(); }} value={this._suggestion.Challenges} />
                                        <FormControl.Feedback />
                                    </FormGroup>


                                    <FormGroup validationState={((this.props.validationMode && (this._suggestion.SuggestedSolution == null || this._suggestion.SuggestedSolution.length <= 0) ? "error" : null))}>
                                        <ControlLabel>{solutionText} *</ControlLabel>
                                        <FormControl placeholder={solutionPlaceholder} componentClass="textarea" onChange={(a: any) => { this._suggestion.SuggestedSolution = this.set(a); this.update(); }} value={this._suggestion.SuggestedSolution} />
                                        <FormControl.Feedback />
                                    </FormGroup>

                                    <FormGroup>
                                        <ControlLabel>Hvilken type nytte?</ControlLabel>
                                        <select id="select-1" className="form-control"
                                            onChange={(a: any) => { this._suggestion.UsefulnessType = this.set(a); this.update(); }} value={this._suggestion.UsefulnessType} >
                                            {this.state.usefulnessTypeChoices.map((val: string, index: number) => {
                                                return <option value={val}>{val}</option>
                                            })}
                                        </select>
                                        {(this._suggestion.UsefulnessType != "Annet") ? "" :
                                            <input id="annet" type="text" onChange={(a: any) => { this._suggestion.UsefulnessType = this.set(a); this.update(); }} />}
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="nyttig">Nyttig for andre?</label>
                                        <input id="nyttig" type="text" placeholder={usefulnessPlaceholderText}
                                            onChange={(a: any) => { this._suggestion.UsefulForOthers = this.set(a); this.update(); }} value={this._suggestion.UsefulForOthers}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>
        )
    }
}