import * as React from "react";
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DataAdapter } from "../../../Data/DataAdapter";
import { NodeView } from "../NodeView";
import { IInspiredByProps } from "./IInspiredByProps";
import { IInspiredByState } from "./IInspiredByState";
import { InspiredByView } from "./InspiredByView";
import { PinTypes } from "./PinTypes";
import { IConnection } from "./IConnection";
import { Suggestion } from "../../../Models";

export class InspiredBy extends React.Component<IInspiredByProps, IInspiredByState>
{
    private suggestions: Suggestion[];
    private map: google.maps.Map = null;

    constructor(props: IInspiredByProps) {
        super(props);
        this.state = { suggestions: [], selectedView: InspiredByView.Map };
    }

    render() {
        var overrideMapView = false;
        if (!this.props.suggestion.Location)
            overrideMapView = true;

        return (
            <span>
                <h3>Forbindelse til andre forslag</h3>
                <p>Visualiseringen nedefor viser hvordan dette forslaget både har blitt inspirert av andre, tidligere, forslag samtidig som det igjen har inspirert nye forslag.</p>
                <div hidden={this.state.selectedView === InspiredByView.Map && overrideMapView === false}>
                    <div style={{ margin: '5px 0 5px 0' }}>
                        <ActionButton text="Endre visning" iconProps={{ iconName: 'MapPin' }} onClick={_ => this.onChangeView(InspiredByView.Map)} />
                    </div>
                    <NodeView Origin={this.props.suggestion} Suggestions={this.state.suggestions} />
                </div>
                <div hidden={this.state.selectedView === InspiredByView.Node || overrideMapView}>
                    <div style={{ margin: '5px 0 5px 0' }}>
                        <ActionButton text="Endre visning" iconProps={{ iconName: 'Share' }} onClick={_ => this.onChangeView(InspiredByView.Node)} />
                    </div>
                    <div className="text-area">
                        <span style={{ backgroundColor: "lime", border: "1px solid black", width: "20px", height: "20px", display: "inline-block" }}></span> - Dette forslaget<br />
                        <span style={{ backgroundColor: "blue", border: "1px solid black", width: "20px", height: "20px", display: "inline-block" }}></span> - Dette forslaget ble inspirert av<br />
                        <span style={{ backgroundColor: "yellow", border: "1px solid black", width: "20px", height: "20px", display: "inline-block" }}></span> - Dette forslaget har inspirert.<br />
                    </div>
                    <div className="img-area">
                        <div id="map" style={{ width: "500px", height: "300px" }}></div>
                    </div>
                </div>
            </span>
        )
    }

    private onChangeView(view: InspiredByView) {
        this.setState({ selectedView: view });
    }

    /**
     * Get pin
     * 
     * @param which 1 = green, 2 = yellow, 3 = red
     */
    getPin(which: PinTypes) {
        switch (which) {
            case PinTypes.Start: return '//maps.google.com/mapfiles/kml/paddle/grn-blank.png';
            case PinTypes.Previous: return '//maps.google.com/mapfiles/kml/paddle/ylw-blank.png';
            case PinTypes.After: return '//maps.google.com/mapfiles/kml/paddle/blu-blank.png'
        }
    }

    getPinIcon(which: PinTypes): any {
        return { url: this.getPin(which), scaledSize: new google.maps.Size(32, 32) };
    }

    drawMap() {
        var startPin = {
            url: '//maps.google.com/mapfiles/kml/paddle/grn-blank.png', // image is 512 x 512
            scaledSize: new google.maps.Size(32, 32)
        };

        var myOptions = {
            zoom: 14,
            center: this.props.suggestion.LocationLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        this.map = new google.maps.Map(document.getElementById("map"), myOptions);
        if (this.props.suggestion.LocationLatLng == null)
            return;

        this.createMarker(this.props.suggestion, PinTypes.Start, null);
        this.getFutureConnections(this.props.suggestion);
        this.getPastConnections(this.props.suggestion);
    }

    createMarker(suggestion: Suggestion, type: PinTypes, connection: IConnection) {
        var marker = new google.maps.Marker({
            position: suggestion.LocationLatLng,
            map: this.map,
            icon: this.getPinIcon(type),
            animation: google.maps.Animation.DROP
        });
        var infowindow = new google.maps.InfoWindow({
            content: "<div><a href='" + suggestion.Url + "'>" + suggestion.Title + "</a></div>"
        })

        marker.addListener('click', () => { infowindow.open(this.map, marker); })

        // Draw arrow between connection
        if (connection == null)
            return;

        if (connection.From == null || connection.To == null)
            return;

        var lineSymbol = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
        };

        var line = new google.maps.Polyline({
            path: [connection.From.LocationLatLng, connection.To.LocationLatLng],
            icons: [{
                icon: lineSymbol,
                offset: '100%'
            }],
            map: this.map,
            strokeOpacity: 0.7

        });
    }


    componentDidMount() {
        var da = new DataAdapter();
        da.getAllSuggestions(null, 2000, "&$filter=KmiStatus ne 'Sendt inn'&$select=Id,Title,KmiLocation,KmiInspiredBy/Id,KmiInspiredBy/Title&$expand=KmiInspiredBy&orderby=Created desc")
            .then((results: Suggestion[]) => {
                this.suggestions = results;
                this.setState({ suggestions: results });
                this.drawMap();
            });
    }

    getPastConnections(suggestion: Suggestion) {
        for (let it of suggestion.InspiredBy) {
            for (let s of this.suggestions) {
                if (it.Id == s.Id) {
                    this.createMarker(s, PinTypes.After, { From: s, To: suggestion });
                    this.getPastConnections(s);
                }
            }
        }

    }


    getFutureConnections(suggestion: Suggestion) {
        for (let s of this.suggestions) {
            for (let it of s.InspiredBy)
                if (it.Id == suggestion.Id) {
                    this.createMarker(s, PinTypes.Previous, { From: suggestion, To: s });
                    this.getFutureConnections(s);
                }
        }
    }

    getSuggestionById(id: number): Suggestion {
        for (let s of this.suggestions) {
            if (s.Id == id)
                return s;
        }
    }
}