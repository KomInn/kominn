import * as React from "react";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Label } from "office-ui-fabric-react/lib/Label";
import { autobind } from "office-ui-fabric-react/lib/Utilities";

interface IAddLocationProps { onDataUpdate?(lat: number, lng: number): void, isRequired?: boolean }
interface IAddLocationState { selectedLocation: google.maps.LatLng, feedbackMessage: string, searchTerm: string }
export class AddLocation extends React.Component<IAddLocationProps, IAddLocationState>
{
    private marker: google.maps.Marker;
    private map: google.maps.Map;

    constructor(props: IAddLocationProps) {
        super(props);
        this.state = { selectedLocation: new google.maps.LatLng(59.8346001, 10.436568699999953), feedbackMessage: null, searchTerm: "" }
    }

    componentWillMount() {
        this.map = null;
        this.marker = null;
        this.getPosition();
    }

    drawMap() {
        var myOptions = {
            zoom: 5,
            center: this.state.selectedLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        this.map = new google.maps.Map(document.getElementById("map"), myOptions);

        google.maps.event.addListener(this.map, 'click', ((event: any) => {
            this.setMarker(event.latLng);
        }));
    }

    setMarker(location: google.maps.LatLng) {
        if (this.marker) {
            this.marker.setPosition(location);
            this.setState({ selectedLocation: location }, () => { this.submitLocation() });
            return;
        }
        this.marker = new google.maps.Marker({ position: location, map: this.map });
        this.setState({ selectedLocation: location }, () => { this.submitLocation() });
    }

    geocodeAddress() {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': this.state.searchTerm }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                this.map.setCenter(results[0].geometry.location);
                this.setMarker(results[0].geometry.location);
                this.setState({ feedbackMessage: null });
            } else {
                this.setState({ feedbackMessage: "Fant ikke adressen, prøv igjen." });
                this.setMarker(null);
            }
        });
    }
    componentDidMount() {
        this.drawMap();
    }

    submitLocation() {
        if (this.state.selectedLocation == null)
            return;

        this.props.onDataUpdate(this.state.selectedLocation.lat(), this.state.selectedLocation.lng());
    }

    @autobind
    getPosition() {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            this.setMarker(new google.maps.LatLng(coords.latitude, coords.longitude));
        })
    }

    render() {
        return (
            <div>
                <Label>Sted (valgfritt)</Label>
                <p>Klikk i kartet for å markere, eller bruk søkefeltet.</p>
                <div id="map" style={{ width: "470px", height: "400px", marginBottom: "20px" }}></div>
                <TextField placeholder="Skriv inn sted" onChange={(_event, newValue) => this.setState({ searchTerm: newValue })} />
                <DefaultButton text="Søk" onClick={this.geocodeAddress} />
                {navigator.geolocation != null && <DefaultButton text="Bruk mitt sted" onClick={this.getPosition} />}
            </div>
        )
    }
}