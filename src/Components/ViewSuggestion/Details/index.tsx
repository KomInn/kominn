import * as React from "react";
import { Tools } from "../../../Tools";
import { IDetailsProps } from "./IDetailsProps";
import { SustainabilityGoals } from "../../Common";

export class Details extends React.Component<IDetailsProps, any>
{
    render() {
        return (
            <>
                <time>{Tools.formatDate(this.props.suggestion.Created)}</time>
                <strong className="author">{this.props.suggestion.Submitter.Name}</strong>
                <address>
                    {this.props.suggestion.Submitter.Address}<br />
                    {this.props.suggestion.Submitter.Zipcode} {this.props.suggestion.Submitter.City}
                </address>
                <div style={{ margin: '10px 0 10px 0' }}>
                    <div><strong>Innsatsområder</strong></div>
                    <ul>
                        {this.props.suggestion.UsefulnessType && this.props.suggestion.UsefulnessType.map((area, idx) => 
                        (<li key={idx}>{area}</li>))}
                    </ul>
                </div>
                <SustainabilityGoals style={{ margin: '10px 0 10px 0' }} goals={this.props.suggestion.SustainabilityGoals} />
            </>
        )
    }
}