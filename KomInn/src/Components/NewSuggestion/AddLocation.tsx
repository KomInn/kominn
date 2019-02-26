import * as React from "react";
import { Row, Col, FormGroup, FormControl, InputGroup, Button } from "react-bootstrap";


interface AddLocationProps { onDataUpdate?(lat:number, lng:number):void, isRequired?: boolean }
interface AddLocationState { selectedLocation:google.maps.LatLng, feedbackMessage:string, searchval:string }
export class AddLocation extends React.Component<AddLocationProps, AddLocationState>
{
    marker:google.maps.Marker;
    map:google.maps.Map; 
    state = { selectedLocation:new google.maps.LatLng(59.8346001,10.436568699999953), feedbackMessage:null, searchval:""}
    componentWillMount()
    {        
        this.map = null;
        this.marker = null; 
        this.getPosition();
    }
    
    drawMap()
    {              
        var myOptions = {
            zoom: 5,
            center: this.state.selectedLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        this.map = new google.maps.Map(document.getElementById("map"), myOptions); 

      google.maps.event.addListener(this.map, 'click', ((event:any) => {	         
         this.setMarker(event.latLng);
      }));
    }

    setMarker(location:google.maps.LatLng)
    {       
        if (this.marker) {
            this.marker.setPosition(location);
            this.setState({selectedLocation:location}, () => { this.submitLocation() });
            return; 
         }
	     this.marker = new google.maps.Marker({position:location, map:this.map}); 
         this.setState({selectedLocation:location}, () => { this.submitLocation() });
    }

    geocodeAddress(address:string) {
        var geocoder = new google.maps.Geocoder();           
        geocoder.geocode({'address': address}, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                this.map.setCenter(results[0].geometry.location);
                this.setMarker(results[0].geometry.location);       
                this.setState({feedbackMessage:null});
    } else {
      this.setState({feedbackMessage:"Fant ikke adressen, prøv igjen."});
      this.setMarker(null);
    
    }
  });
}
    componentDidMount()
    {        
        this.drawMap();
    }

    submitLocation()
    {           
        if(this.state.selectedLocation == null)
            return; 

        this.props.onDataUpdate(this.state.selectedLocation.lat(), this.state.selectedLocation.lng()); 
    }
    getPosition()
    {        
        navigator.geolocation.getCurrentPosition( (pos:any) => {                         
            this.setMarker(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)); 
        })
    }
    render()
    {
        var geo = navigator.geolocation;         
        return (
            <Row>                 
                <Col xs={12}>        
                    <div className="form-area">
                        <label htmlFor="sted">Sted {this.props.isRequired ? "" : <span>(valgfritt)</span>}</label>
                        <p>Klikk i kartet for å markere, eller bruk søkefeltet.</p>
                        <div id="map" style={{width:"470px",height:"400px", marginBottom: "20px"}}></div>
                        <FormGroup validationState={ (this.state.feedbackMessage == null) ? null : "error" }>
                            <InputGroup>
                                <FormControl type="text" style={{width:"393px"}} placeholder="Skriv inn sted" onChange={ (e:any) => this.setState({searchval:e.target.value})} />                       
                                <FormControl.Feedback />
                                <Button className="custombtn" onClick={ () => this.geocodeAddress(this.state.searchval) }>
                                    Søk
                                </Button>                     
                            </InputGroup>
                            
                        </FormGroup>                            
                        { (geo == null) ? "" : 
                        <span><span className="separator" style={{marginRight: "5px"}}>eller</span>
                        <a href="#" className="btn" onClick={this.getPosition.bind(this)}>Bruk mitt sted</a></span>}
                    </div>     
                </Col>
            </Row>                    
        )
    }
}