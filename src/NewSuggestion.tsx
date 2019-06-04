import * as React from "react";
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

interface NewSuggestionState { suggestion: Suggestion, formInvalid: boolean, submitted: boolean }
export class NewSuggestion extends React.Component<any, NewSuggestionState>
{
    state = { suggestion: new Suggestion(), formInvalid: false, submitted: false };

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
    updatePerson(p: Person) {
        var s = this.state.suggestion;
        s.Submitter = p;
        this.setState({ suggestion: s }, () => console.log(this.state.suggestion));
    }
    updateImage(pictureURL: string) {
        var s = this.state.suggestion;
        s.Image = pictureURL;
        this.setState({ suggestion: s });
    }
    updateLocation(lat: number, lon: number) {
        var s = this.state.suggestion;
        s.Location = lat + "," + lon;
        this.setState({ suggestion: s });
    }
    updateInspiredBy(inspiredby: Array<Suggestion>) {
        var s = this.state.suggestion;
        s.InspiredBy = inspiredby;
        this.setState({ suggestion: s });
    }
    updateGoals(goals:Array<SustainabilityGoal>)
    {
        var s = this.state.suggestion;
        s.SustainabilityGoals = goals; 
        this.setState({suggestion:s}); 
    }

    submitSuggestion()
    {
        if(!this.state.suggestion.Validates)
        {
            this.setState({formInvalid:true}); 
            return; 
        }                
        var d = new DataAdapter();
        d.submitSuggestion(this.state.suggestion).then(() => {
            this.setState({ submitted: true });
        })
    }

    render() {
        if (this.state.submitted) {
            return (
                <div className="container-fluid newsuggestion-container contacts-form">
                    <h1 style={{ color: "black" }}>Takk</h1>
                    <p>Ditt forslag er mottatt og vil bli gjennomgått av en saksbehandler.</p>
                    <p><a href={_spPageContextInfo.webAbsoluteUrl}>Klikk her for å gå tilbake til hovedsiden</a></p>
                </div>
            )
        }
        return (
            <div className="container-fluid newsuggestion-container contacts-form">
                <CommonFields onSuggestionUpdate={this.updateSuggestion.bind(this)} validationMode={this.state.formInvalid} />
                <Personalia onDataUpdate={this.updatePerson.bind(this)} validationMode={this.state.formInvalid} />
                <UploadImages onDataUpdate={this.updateImage.bind(this)} />
                <AddLocation onDataUpdate={this.updateLocation.bind(this)} />
                <SustainabilityGoals onDataUpdate={this.updateGoals.bind(this)} />
                <InspiredBy onDataUpdate={this.updateInspiredBy.bind(this)} />
                <div className="form-area">
                    <ul className="btn-list">
                        <li><a href="#" className="btn" onClick={this.submitSuggestion.bind(this)}>Send inn</a></li>
                    </ul>
                    {(!this.state.formInvalid) ? "" :
                        <p style={{ color: "red" }}>Du må fylle ut alle påkrevde felter før du kan sende inn skjemaet.</p>}
                </div>
            </div>)
    }
}
