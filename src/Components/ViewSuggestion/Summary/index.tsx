import * as React from "react";
import anchorme from "anchorme";
import { ISummaryProps } from "./ISummaryProps";

export class Summary extends React.Component<ISummaryProps, {}>
{
    render() {
        return (
            <>
                <div className="text-area">
                    <h3>Beskrivelse av tiltaket</h3>
                    <p dangerouslySetInnerHTML={{ __html: anchorme(this.props.suggestion.Summary || "") }}></p>
                </div>
                <div className="text-area">
                    <h3>Hvorfor er dette et klimatiltak?</h3>
                    <p dangerouslySetInnerHTML={{ __html: anchorme(this.props.suggestion.Challenges || "") }}></p>
                </div>
                <div className="text-area">
                    <h3>Søkt beløp</h3>
                    <p>NOK {this.props.suggestion.Amount}</p>
                </div>
            </>
        )
    }
}