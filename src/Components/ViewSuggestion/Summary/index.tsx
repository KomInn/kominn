import * as React from "react";
import anchorme from "anchorme";
import { ISummaryProps } from "./ISummaryProps";

export class Summary extends React.Component<ISummaryProps, {}>
{
    render() {
        return (
            <>
                <div className="text-area">
                    <h3>Sammendrag</h3>
                    <p dangerouslySetInnerHTML={{ __html: anchorme(this.props.suggestion.Summary || "") }}></p>
                </div>
                <div className="text-area">
                    <h3>Utfordringer</h3>
                    <p dangerouslySetInnerHTML={{ __html: anchorme(this.props.suggestion.Challenges || "") }}></p>
                </div>
                <div className="text-area">
                    <h3>Løsningsforslag</h3>
                    <p dangerouslySetInnerHTML={{ __html: anchorme(this.props.suggestion.SuggestedSolution || "") }}></p>
                </div>
            </>
        )
    }
}