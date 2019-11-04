import * as React from "react";
import { SustainabilityGoal } from "../../../Models";
import { ISustainabilityGoalsProps } from "./ISustainabilityGoalsProps";

export class SustainabilityGoals extends React.Component<ISustainabilityGoalsProps, {}>
{
    public static defaultProps: Partial<ISustainabilityGoalsProps> = { showTitle: true };

    render() {
        return (
            <div style={this.props.style} hidden={this.props.goals.length === 0}>
                <div hidden={!this.props.showTitle}><strong>Bærekraftsmål</strong></div>
                <div>
                    {this.props.goals.map((goal: SustainabilityGoal, idx: number) => {
                        return (
                            <img
                                key={idx}
                                src={goal.ImageSrc}
                                style={{ display: "inline-block", minHeight: "auto", height: "47px", width: "47px", marginTop: "2px", marginRight: "5px" }} />
                        )
                    })}
                </div>
            </div>
        )
    }
}