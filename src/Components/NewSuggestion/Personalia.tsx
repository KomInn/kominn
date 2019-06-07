import * as React from "react";
import { Row, Col, FormGroup, FormControl, HelpBlock, ControlLabel } from "react-bootstrap";
import { Person } from "../Common/Person";
import { DataAdapter } from "../Common/DataAdapter";

// TODO: Implement validation
interface PersonaliaProps { onDataUpdate?(person: Person): void, validationMode?: boolean }
interface PersonaliaState { profile: Person }
enum Fields { Name, Address, Zipcode, MailAddress, Telephone, CountyCode };
export class Personalia extends React.Component<PersonaliaProps, PersonaliaState>
{
    state = { profile: new Person() };

    componentWillMount() {
        var da = new DataAdapter();
        da.getMyUserProfile().then((result: Person) => {
            this.setState({ profile: result }, () => this.update());
        })

    }
    update() {
        this.props.onDataUpdate(this.state.profile);
    }
    set(event: any) {
        return event.target.value;
    }


    updateField(evt: any, field: Fields) {
        var val = evt.target.value;
        var s = this.state.profile;
        switch (field) {
            case Fields.Address: s.Address = val; break;
            case Fields.MailAddress: s.MailAddress = val; break;
            case Fields.Name: s.Name = val; break;
            case Fields.Telephone: s.Telephone = val; break;
            case Fields.Zipcode: s.Zipcode = val; break;
        }


        this.setState({ profile: s },
            () => {
                if (field == Fields.Zipcode) {
                    if (val.length == 4) {

                        var da = new DataAdapter();
                        var person = new Person();
                        person.Zipcode = val;
                        da.getCityAndCountryCode(person).then((result: Person) => {
                            var k = this.state.profile;
                            if (person.CountyCode == null || person.CountyCode.length <= 0)
                                return;

                            k.CountyCode = result.CountyCode;
                            k.City = result.City;
                            this.setState({ profile: k });
                        });
                    }
                }
                this.update()
            });
    }

    render() {

        return (
            <Row>
                <Col xs={12}>
                    <div className="contacts-form">
                        <hr />
                        <Row>
                            <Col xs={12}>
                                <FormGroup validationState={((this.props.validationMode && (this.state.profile.Name == null || this.state.profile.Name.length <= 0) ? "error" : null))}>
                                    <ControlLabel>Navn *</ControlLabel>
                                    <FormControl type="text"
                                        onChange={(a: any) => { this.updateField(a, Fields.Name) }} value={this.state.profile.Name} />
                                    <FormControl.Feedback />
                                </FormGroup>

                                <label htmlFor="Adresse">Adresse</label>
                                <input id="Address" type="text"
                                    onChange={(a: any) => { this.updateField(a, Fields.Address) }} value={this.state.profile.Address} />
                                <label htmlFor="Zip">Postnummer</label>
                                <input id="Zip" type="text" style={{ width: "65px" }}
                                    onChange={(a: any) => { this.updateField(a, Fields.Zipcode) }} value={this.state.profile.Zipcode} />
                                <div className="city">{this.state.profile.City}</div>
                                <label htmlFor="Email">E-post</label>
                                <input id="Email" type="text"
                                    onChange={(a: any) => { this.updateField(a, Fields.MailAddress) }} value={this.state.profile.MailAddress} />
                                <label htmlFor="Telephone">Telefon</label>
                                <input id="Telefon" type="text"
                                    onChange={(a: any) => { this.updateField(a, Fields.Telephone) }} value={this.state.profile.Telephone} />
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        )
    }
}