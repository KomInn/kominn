import * as React from "react";
import { Row, Col } from "react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import anchorme from "anchorme"; 

 

interface SummaryProps { suggestion:Suggestion }
export class Summary extends React.Component<SummaryProps, any>
{
    render()
    {
        var summary = (this.props.suggestion.Summary) ? this.props.suggestion.Summary : ""; 
        var challenges = (this.props.suggestion.Challenges) ? this.props.suggestion.Challenges : ""; 
        var solution = (this.props.suggestion.SuggestedSolution) ? this.props.suggestion.SuggestedSolution : ""; 
        return (
            <Row>
                <Col xs={12}>                
                    <div className="text-area">
                        <h3>Sammendrag</h3>
                        <p dangerouslySetInnerHTML={ {__html:anchorme(summary)}}></p>
                    </div>
                    <div className="text-area">
                        <h3>Utfordringer</h3>                        
                        <p dangerouslySetInnerHTML={ {__html:anchorme(challenges)}}></p>
                    </div>
                    <div className="text-area">
                        <h3>Løsningsforslag</h3>
                        <p dangerouslySetInnerHTML={ {__html:anchorme(solution)}}></p>
                        
                    </div>                   
                </Col>
            </Row>                    
        )
    }
}