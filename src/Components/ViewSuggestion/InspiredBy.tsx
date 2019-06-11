import * as React from "./node_modules/react";
import { Row, Col, Button } from "./node_modules/react-bootstrap";
import { Suggestion } from "../Common/Suggestion";
import { DataAdapter } from "../Common/DataAdapter";
import { Status } from "../Common/Status";
import { NodeView } from "./NodeView"; 
import "./node_modules/vis"; 
import * as vis from "./node_modules/vis";


enum InspiredByView { Map, Node }
interface InspiredByProps { suggestion: Suggestion }
interface InspiredByState { suggestions?:Suggestion[], SelectedView?:InspiredByView }
enum PinTypes { Start, After, Previous }
interface Connection { From: Suggestion, To: Suggestion }
export class InspiredBy extends React.Component<InspiredByProps, InspiredByState>
{
    private suggestions: Array<Suggestion>;   
    private map: google.maps.Map;
         
    state ={ suggestions:new Array<Suggestion>(), SelectedView:InspiredByView.Map}
    
    componentWillMount()
    {
        this.map = null;
    }
    
    /**
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
        return {
            url: this.getPin(which),
            scaledSize: new google.maps.Size(32, 32)
        };
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
        if(this.props.suggestion.LocationLatLng == null)
            return; 
        
        this.createMarker(this.props.suggestion, PinTypes.Start, null);
        this.getFutureConnections(this.props.suggestion);
        this.getPastConnections(this.props.suggestion);     
    }
    createMarker(suggestion:Suggestion, type: PinTypes, connection: Connection) {        
        var marker = new google.maps.Marker({
            position: suggestion.LocationLatLng,
            map: this.map,
            icon: this.getPinIcon(type),
            animation: google.maps.Animation.DROP
        }); 
        var infowindow = new google.maps.InfoWindow({
            content: "<div><a href='"+suggestion.Url+"'>"+suggestion.Title+"</a></div>"
        })

        marker.addListener('click', () => { infowindow.open(this.map, marker); })

        // Draw arrow between connection
        if(connection == null)
            return; 

        if(connection.From == null || connection.To == null)
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
          strokeOpacity:0.7
          
        });                    
    }

    
    componentDidMount() {
        var da = new DataAdapter();
        da.getAllSuggestions(null, 2000, "&$filter=KmiStatus ne 'Sendt inn'&$select=Id,Title,KmiLocation,KmiInspiredBy/Id,KmiInspiredBy/Title&$expand=KmiInspiredBy&orderby=Created desc")
            .then((results: Array<Suggestion>) => {
                this.suggestions = results;
                this.setState({suggestions:results});
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

    
    getFutureConnections(suggestion: Suggestion){         
        for (let s of this.suggestions) {
            for (let it of s.InspiredBy)
                if (it.Id == suggestion.Id) {
                    this.createMarker(s, PinTypes.Previous, { From: suggestion, To:s });                   
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

    renderMapIcon()
    {
        return (<svg viewBox="0 0 1792 1792" width="16"><path d="M1152 640q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zm256 0q0 109-33 179l-364 774q-16 33-47.5 52t-67.5 19-67.5-19-46.5-52l-365-774q-33-70-33-179 0-212 150-362t362-150 362 150 150 362z"/></svg>);
    }


    renderShareIcon()
    {
        return (<svg version="1.1" viewBox="0 0 80 90" width="16"><g><path d="M65,60c-3.436,0-6.592,1.168-9.121,3.112L29.783,47.455C29.914,46.654,30,45.837,30,45c0-0.839-0.086-1.654-0.217-2.456   l26.096-15.657C58.408,28.833,61.564,30,65,30c8.283,0,15-6.717,15-15S73.283,0,65,0S50,6.717,50,15   c0,0.837,0.086,1.654,0.219,2.455L24.123,33.112C21.594,31.168,18.438,30,15,30C6.717,30,0,36.717,0,45s6.717,15,15,15   c3.438,0,6.594-1.167,9.123-3.113l26.096,15.657C50.086,73.346,50,74.161,50,75c0,8.283,6.717,15,15,15s15-6.717,15-15   S73.283,60,65,60z"/></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>);
    }

    render() {  
        
        var flippedView = (this.state.SelectedView === InspiredByView.Map) ? InspiredByView.Node : InspiredByView.Map; 
        var overrideMapView = false; 
        if(!this.props.suggestion.Location)
            overrideMapView = true; 

        return (
            <span>
                 <h3>Forbindelse til andre forslag</h3>
                <p>Visualiseringen nedefor viser hvordan dette forslaget både har blitt inspirert av andre, tidligere, forslag samtidig som det igjen har inspirert nye forslag.</p>
            <Row>
                <Col xs={12} hidden={overrideMapView === true}> 
                    <b>Visning</b><br/>
                    <Button selected={true} onClick={() => { this.setState({SelectedView:flippedView}) }} style={{marginBottom:"10px", height:"50px"}}>
                            {(this.state.SelectedView === InspiredByView.Map) ? this.renderShareIcon() : this.renderMapIcon()}
                    </Button>
                </Col>
            </Row>
            <Row hidden={this.state.SelectedView === InspiredByView.Map && overrideMapView === false}>
                <NodeView Origin={this.props.suggestion} Suggestions={this.state.suggestions}  />
            </Row>
            <Row hidden={this.state.SelectedView === InspiredByView.Node || overrideMapView}>
                <Col xs={12}>
                <div className="text-area">                   
                    <span style={{backgroundColor:"lime", border:"1px solid black", width:"20px", height:"20px", display:"inline-block"}}></span> - Dette forslaget<br/>
                    <span style={{backgroundColor:"blue", border:"1px solid black", width:"20px", height:"20px", display:"inline-block"}}></span> - Dette forslaget ble inspirert av<br/>
                    <span style={{backgroundColor:"yellow", border:"1px solid black", width:"20px", height:"20px", display:"inline-block"}}></span> - Dette forslaget har inspirert.<br/>
                </div>
                <div className="img-area">
                    <div id="map" style={{ width: "500px", height: "300px" }}></div>
                </div>
                </Col>
            </Row>
            </span>
        )
    }
}