import * as React from "./node_modules/react";
import { Row } from "./node_modules/react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { Tools } from "../Common/Tools";
import { SustainabilityGoal } from "../Common/SustainabilityGoal";

interface MapProps { suggestion: Suggestion }
export class MapView extends React.Component<MapProps, any>
{
    render() {
        return (
            <Row>
                <div className="sub-box">
                    <time>{Tools.FormatDate(this.props.suggestion.Created)}</time>
                    <strong className="author">{this.props.suggestion.Submitter.Name}</strong>
                    <address>
                        {this.props.suggestion.Submitter.Address}<br />
                        {this.props.suggestion.Submitter.Zipcode} {this.props.suggestion.Submitter.City}
                    </address>
                    <span className="type-frame">Nyttetype: {this.props.suggestion.UsefulnessType}</span>
                    <span className="type-frame">Bærekraftsmål:<br />
                        {this.props.suggestion.SustainabilityGoals.map((goal: SustainabilityGoal, idx: number) => {
                            return <img key={idx} src={goal.ImageSrc} style={{ display: "inline-block", minHeight: "auto", height: "47px", width: "47px", marginTop: "2px", marginRight: "5px" }} />
                        })}
                    </span>
                </div>
                <div className="map-block hidden-xs">
                    {(this.props.suggestion.Location == null) ? "" :
                        <iframe
                            src={this.props.suggestion.MapUrl}
                            width="600"
                            height="450"
                        ></iframe>}
                </div>
            </Row>
        )
    }
}