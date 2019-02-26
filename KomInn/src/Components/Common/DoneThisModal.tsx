import * as React from "react";
import { Button, Modal, FormControl, InputGroup, FormGroup } from "react-bootstrap";
import { AddLocation } from "../NewSuggestion/AddLocation";
import { Suggestion } from "./Suggestion"; 
import { DataAdapter } from "./DataAdapter";



interface IDoneThisModalState { suggestion:Suggestion,  formInvalid:boolean, submitted:boolean, organization:string}
interface IDoneThisModalProps { show:boolean, onClose():void, inspiredBy:Suggestion }
export class DoneThisModal extends React.Component<IDoneThisModalProps, IDoneThisModalState> 
{    
    state = { suggestion: new Suggestion(), formInvalid:false, submitted: false, organization:"" };        
    
    updateLocation(lat:number, lon:number)
    {
        var s = this.state.suggestion; 
        s.Location = lat + "," + lon;
        this.setState({suggestion:s}); 
    }

    submitSuggestion()
    {
        if (!this.state.suggestion.Location)   {
            this.setState({formInvalid:true}); 
            return;
        }
        var s = this.state.suggestion; 
        s.IsPast = true;
        s.Title = "Dette vil vi også gjøre: " + this.state.organization
        var i = new Array<Suggestion>();
        s.InspiredBy = i; 
        s.InspiredBy.push(this.props.inspiredBy);
        
        console.log("subimit ", s); 
        var d = new DataAdapter();
        d.submitSuggestion(s).then( () => { 
            this.setState({submitted:true}, () => { 
                this.close();
            }); 
        }) 
    }

    close()
    {       
        this.props.onClose(); 
    }
    
    render() 
    {       
        return (
        <div className="modal-container">
            <Modal
            show={this.props.show}
            onHide={this.close.bind(this)}
            container={this}
            aria-labelledby="contained-modal-title"
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title">Dette har vi også gjort</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AddLocation onDataUpdate={this.updateLocation.bind(this)} isRequired={true} />
                <br/>
                
                <FormGroup>
                <InputGroup>
                    <label>Virksomhet</label>
                    <FormControl type="text" value={this.state.organization} onChange={ (evt:any) => this.setState({organization:evt.target.value})} /> 
                </InputGroup>
                </FormGroup>
                { (!this.state.formInvalid) ? "" : 
                    <p style={{color:"red"}}>Du må fylle ut lokasjon for å si at 'Dette har dere også gjort'.</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="warning" className="pull-left beige" onClick={close}>Avbryt</Button>
                <Button bsStyle="primary" onClick={this.submitSuggestion.bind(this)}>Lagre</Button>
            </Modal.Footer>
            </Modal>
        </div>
        );
    }
}