import * as React from "react";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { IMapViewProps } from "./IMapViewProps";

export class MapView extends React.Component<IMapViewProps, any>
{
    render() {
        return (
            <div className="map-block hidden-xs">
                {(this.props.suggestion.Location != null && this.props.apiKey)
                    ?
                    (

                        <iframe
                            src={this.props.suggestion.GetMapUrl(this.props.apiKey)}
                            width="600"
                            height="450"
                        ></iframe>
                    )
                    : (
                        <MessageBar messageBarType={MessageBarType.severeWarning}>Det skjedde en feil. Kan ikke vise kart. Har du satt sted for forslaget?</MessageBar>
                    )
                }
            </div>
        )
    }
}