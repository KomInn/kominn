import * as React from "react";

interface ErrorLabelProperties { Text:string, Show:boolean }
export class ErrorLabel extends React.Component<ErrorLabelProperties, any> {
    render()
    {
        if(!this.props.Show)        
        {
            return <span></span>; 
        }

        return <span className="errorlabel">{this.props.Text}</span>
    }
}