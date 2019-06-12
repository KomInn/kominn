import * as React from "react";
import { Searchbar } from "./Components/Frontpage/Searchbar";
import { CommonFields } from "./Components/NewSuggestion/CommonFields"
import { Personalia } from "./Components/NewSuggestion/Personalia";
import { UploadImages } from "./Components/NewSuggestion/UploadImages";
import { AddLocation } from "./Components/NewSuggestion/AddLocation";
import { InspiredBy } from "./Components/NewSuggestion/InspiredBy";
import { Suggestion } from "./Components/Common/Suggestion";
import { Person } from "./Components/Common/Person";
import { DataAdapter } from "./Components/Common/DataAdapter";
import { SustainabilityGoals } from "./Components/NewSuggestion/SustainabilityGoals";
import { SustainabilityGoal } from "./Components/Common/SustainabilityGoal";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { autobind } from "office-ui-fabric-react/lib/Utilities";

interface INewSuggestionState { suggestion: Suggestion, formInvalid: boolean, submitted?: boolean }

export class NewSuggestion extends React.Component<any, INewSuggestionState>
{
    private dataAdapter = new DataAdapter();

    constructor(props: any) {
        super(props);
        this.state = {
            suggestion: new Suggestion(),
            formInvalid: false,
        };
    }

    @autobind
    updateSuggestion(s: Suggestion) {
        var su = this.state.suggestion;
        su.Title = s.Title;
        su.Challenges = s.Challenges;
        su.Summary = s.Summary;
        su.SuggestedSolution = s.SuggestedSolution;
        su.UsefulnessType = s.UsefulnessType;
        su.UsefulForOthers = s.UsefulForOthers;
        this.setState({ suggestion: su });
    }

    @autobind
    updatePerson(p: Person) {
        var s = this.state.suggestion;
        s.Submitter = p;
        this.setState({ suggestion: s }, () => console.log(this.state.suggestion));
    }

    @autobind
    updateImage(pictureURL: string) {
        var s = this.state.suggestion;
        s.Image = pictureURL;
        this.setState({ suggestion: s });
    }

    @autobind
    updateLocation(lat: number, lon: number) {
        var s = this.state.suggestion;
        s.Location = lat + "," + lon;
        this.setState({ suggestion: s });
    }

    @autobind
    updateInspiredBy(inspiredby: Array<Suggestion>) {
        var s = this.state.suggestion;
        s.InspiredBy = inspiredby;
        this.setState({ suggestion: s });
    }

    @autobind
    updateGoals(goals: Array<SustainabilityGoal>) {
        var s = this.state.suggestion;
        s.SustainabilityGoals = goals;
        this.setState({ suggestion: s });
    }

    @autobind
    submitSuggestion() {
        if (!this.state.suggestion.Validates) {
            this.setState({ formInvalid: true });
            return;
        }
        this.dataAdapter.submitSuggestion(this.state.suggestion).then(() => {
            this.setState({ submitted: true });
        })
    }

    render() {
        if (this.state.submitted) {
            return (
                <>
                    <Searchbar
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
                    showBackButton={true}
                    showSearchBox={false}
                    showSuggestionButtons={false} />
                <div className="NewSuggestion">
                    <CommonFields
                        onSuggestionUpdate={this.updateSuggestion}
                        validationMode={this.state.formInvalid} />
                    <Personalia
                        onDataUpdate={this.updatePerson}
                        validationMode={this.state.formInvalid} />
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
