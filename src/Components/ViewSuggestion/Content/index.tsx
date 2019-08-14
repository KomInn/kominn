import * as React from "react";
import { IContentProps } from "./IContentProps";

export class Content extends React.Component<IContentProps, any>
{
    render() {
        const hasImage = (this.props.suggestion.Image != null && this.props.suggestion.Image !== "");
        return (
            <div>
                <h1>{this.props.suggestion.Title}</h1>
                <div>
                    {hasImage && <img src={this.props.suggestion.Image} width="531" height="299" alt="" />}
                </div>
            </div>
        )
    }
}
