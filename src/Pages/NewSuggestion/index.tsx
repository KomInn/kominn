import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { autobind } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { Searchbar } from "../../Components/Frontpage";
import { AddLocation, CommonFields, InspiredBy, Personalia, SustainabilityGoals, UploadImages } from "../../Components/NewSuggestion";
import { DataAdapter } from "../../Data/DataAdapter";
import { Person, Suggestion, SustainabilityGoal } from "../../Models";
import { INewSuggestionProps } from "./INewSuggestionProps";
import { INewSuggestionState } from "./INewSuggestionState";
import "./NewSuggestion.module.scss";

export class NewSuggestion extends React.Component<INewSuggestionProps, INewSuggestionState>
{
    private dataAdapter = new DataAdapter();

    constructor(props: INewSuggestionProps) {
        super(props);
        this.state = {
            suggestion: new Suggestion(),
            formInvalid: false,
        };
    }

    @autobind
    updateSuggestion(s: Suggestion) {
        let { suggestion } = { ...this.state } as INewSuggestionState;
        suggestion.Title = s.Title;
        suggestion.Challenges = s.Challenges;
        suggestion.Summary = s.Summary;
        suggestion.SuggestedSolution = s.SuggestedSolution;
        suggestion.UsefulnessType = s.UsefulnessType;
        suggestion.UsefulForOthers = s.UsefulForOthers;
        this.setState({ suggestion });
    }

    @autobind
    updatePerson(submittter: Person) {
        let { suggestion } = { ...this.state } as INewSuggestionState;
        suggestion.Submitter = submittter;
        this.setState({ suggestion });
    }

    @autobind
    updateImage(pictureURL: string) {
        let { suggestion } = { ...this.state } as INewSuggestionState;
        suggestion.Image = pictureURL;
        this.setState({ suggestion });
    }

    @autobind
    updateLocation(lat: number, lon: number) {
        let { suggestion } = { ...this.state } as INewSuggestionState;
        suggestion.Location = lat + "," + lon;
        this.setState({ suggestion });
    }

    @autobind
    updateInspiredBy(inspiredby: Suggestion[]) {
        let { suggestion } = { ...this.state } as INewSuggestionState;
        suggestion.InspiredBy = inspiredby;
        this.setState({ suggestion });
    }

    @autobind
    updateGoals(goals: Array<SustainabilityGoal>) {
        let { suggestion } = { ...this.state } as INewSuggestionState;
        suggestion.SustainabilityGoals = goals;
        this.setState({ suggestion });
    }

    @autobind
    async submitSuggestion() {
        if (!this.state.suggestion.Validates) {
            this.setState({ formInvalid: true });
            return;
        }
        await this.dataAdapter.submitSuggestion(this.state.suggestion);
        this.setState({ submitted: true });
    }

    render() {
        if (this.state.submitted) {
            return (
                <>
                    <Searchbar
                        placeholderText="Søk etter forslag..."
                        showBackButton={true}
                        showSearchBox={false}
                        showSuggestionButtons={false} />
                    <div className="NewSuggestion">
                        <h1 style={{ color: "black" }}>Takk</h1>
                        <p>Ditt forslag er mottatt og vil bli gjennomgått av en saksbehandler.</p>
                        <p><a href={_spPageContextInfo.webAbsoluteUrl}>Klikk her for å gå tilbake til hovedsiden</a></p>
                    </div>
                </>
            )
        }
        return (
            <>
                <Searchbar
                    placeholderText="Søk etter forslag..."
                    showBackButton={true}
                    showSearchBox={false}
                    showSuggestionButtons={false} />
                <div className="NewSuggestion">
                    <CommonFields onSuggestionUpdate={this.updateSuggestion} validationMode={this.state.formInvalid} />
                    <Personalia onDataUpdate={this.updatePerson} validationMode={this.state.formInvalid} />
                    <UploadImages onDataUpdate={this.updateImage} />
                    <AddLocation onDataUpdate={this.updateLocation} />
                    <SustainabilityGoals onDataUpdate={this.updateGoals} />
                    <InspiredBy onDataUpdate={this.updateInspiredBy} />
                    <PrimaryButton text="Send inn" onClick={this.submitSuggestion} style={{ marginTop: 15 }} />
                    {this.state.formInvalid && <p style={{ color: "red" }}>Du må fylle ut alle påkrevde felter før du kan sende inn skjemaet.</p>}
                </div>
            </>
        );
    }
}
