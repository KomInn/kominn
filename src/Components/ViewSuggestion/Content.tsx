import * as React from "react";
import { Roreact-bootstrapreact-bootstrap";
import { Suggestion } from "../Common/Suggestion";

interface ContentProps { suggestion?:Suggestion }
export class Content extends React.Component<ContentProps, any>
{
    render()
    {
        return (
            <Row>                
                <h2>{this.props.suggestion.Title}</h2>
                <div className="item-holder">
                     { (this.props.suggestion.Image == null || this.props.suggestion.Image == "") ? "" : 
                    <div className="img-frame">    
                        <style>{`.item-holder img { max-height:none !important; margin-left:10px }`}</style>                   
                        <img src={this.props.suggestion.Image} width="531" height="299" alt=""/>
                    </div>}
                </div>  
            </Row>                    
        )
    }
}
